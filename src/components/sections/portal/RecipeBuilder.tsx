'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { GUTTER } from '@/components/sections/editorial'
import {
  AddRowButton,
  Alert,
  areaClass,
  CheckboxRow,
  Field,
  FieldGrid,
  fieldClass,
  GhostButton,
  PrimaryButton,
  RepeatableRow,
  SelectField,
} from './PortalForm'
import { PortalMasthead, PortalPanel, StatusChip } from './PortalShell'
import { PickedProductChip, ProductPicker, type PickedProduct } from './ProductPicker'
import { CUISINES, RECIPE_COURSES, RECIPE_DIFFICULTY, labelFor } from '@/lib/portal-options'
import { UNIT_GROUPS, formatIngredientAmount, unitTakesQuantity } from '@/lib/units'
import { cn } from '@/lib/cn'

/**
 * The recipe builder.
 *
 * An ingredient here is three things and no others: a product from our
 * catalogue, a quantity, and a unit. There is no free-text ingredient field
 * anywhere on this page, because adding one would quietly undo the reason the
 * feature exists — a recipe whose ingredients are all things a reader can put
 * in a basket.
 *
 * Two guards make that hold rather than merely suggest it. The picker can only
 * return catalogue rows, and the Recipes collection stores the ingredient as a
 * `relationship`, so a hand-written POST cannot smuggle a string in either.
 *
 * Saving is explicit and two-headed: Save draft keeps it private and editable,
 * Submit puts it in the review queue. A chef can move between the two as often
 * as they like until we publish it, at which point the row becomes editorial
 * content and the portal stops offering to edit it.
 */

const MAX_INGREDIENTS = 40
const MAX_STEPS = 40

interface IngredientRow {
  product: PickedProduct | null
  quantity: string
  unit: string
  preparation: string
  section: string
  variantSku: string
  optional: boolean
}

interface StepRow {
  instruction: string
  timerMinutes: string
}

const emptyIngredient = (): IngredientRow => ({
  product: null,
  quantity: '',
  unit: 'g',
  preparation: '',
  section: '',
  variantSku: '',
  optional: false,
})

const emptyStep = (): StepRow => ({ instruction: '', timerMinutes: '' })

export interface RecipeDraft {
  id?: number
  title: string
  summary: string
  course: string
  cuisine: string
  difficulty: string
  servings: string
  prepMinutes: string
  cookMinutes: string
  chefTips: string
  pairing: string
  allergens: string
  heroImageId: number | null
  heroImageUrl: string | null
  ingredients: IngredientRow[]
  method: StepRow[]
  status: string
  reviewFeedback?: string | null
}

const BLANK: RecipeDraft = {
  title: '',
  summary: '',
  course: '',
  cuisine: '',
  difficulty: 'intermediate',
  servings: '4',
  prepMinutes: '',
  cookMinutes: '',
  chefTips: '',
  pairing: '',
  allergens: '',
  heroImageId: null,
  heroImageUrl: null,
  ingredients: [emptyIngredient()],
  method: [emptyStep()],
  status: 'draft',
}

/** Native <optgroup>, so 27 units stay findable in one control. */
function UnitSelect({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(fieldClass, 'cursor-pointer')}
    >
      {UNIT_GROUPS.map((group) => (
        <optgroup key={group.group} label={group.label}>
          {group.units.map((unit) => (
            <option key={unit.value} value={unit.value}>
              {unit.name === unit.label ? unit.name : `${unit.name} (${unit.label})`}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

function validate(draft: RecipeDraft): string | null {
  if (!draft.title.trim()) return 'Please give the recipe a title.'
  if (draft.summary.trim().length < 20) {
    return 'Please write a sentence or two of summary — it is what appears on the recipe card.'
  }
  if (!draft.course) return 'Please choose which course this is.'

  const servings = Number(draft.servings)
  if (!Number.isFinite(servings) || servings < 1) return 'Please say how many the recipe serves.'

  const filled = draft.ingredients.filter((row) => row.product)
  if (filled.length === 0) {
    return 'A recipe needs at least one ingredient from the catalogue.'
  }
  for (const row of filled) {
    if (unitTakesQuantity(row.unit) && !Number(row.quantity)) {
      return `How much ${row.product?.title}? Every ingredient needs a quantity, unless its unit is "to taste".`
    }
  }

  const steps = draft.method.filter((step) => step.instruction.trim())
  if (steps.length === 0) return 'Please write at least one step of method.'

  return null
}

export function RecipeBuilder({ initial }: { initial?: RecipeDraft }) {
  const router = useRouter()
  const [draft, setDraft] = useState<RecipeDraft>(initial ?? BLANK)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [saving, setSaving] = useState<'draft' | 'submit' | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (initial) setDraft(initial)
  }, [initial])

  const set = <K extends keyof RecipeDraft>(key: K, value: RecipeDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const setIngredient = (index: number, patch: Partial<IngredientRow>) => {
    setDraft((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }))
  }

  const setStep = (index: number, patch: Partial<StepRow>) => {
    setDraft((prev) => ({
      ...prev,
      method: prev.method.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }))
  }

  /**
   * Uploads straight to /api/media. The Media collection lets the `chef` role
   * create and nothing else, so this is the one write a contributor makes
   * outside their own recipes.
   */
  async function uploadHero(file: File) {
    setUploading(true)
    setError(null)
    try {
      const body = new FormData()
      body.append('file', file)
      // `alt` is required on Media, and a photograph with no alt text is worse
      // than one whose alt text is the dish's name.
      body.append('_payload', JSON.stringify({ alt: draft.title.trim() || 'Recipe photograph' }))

      const res = await fetch('/api/media', { method: 'POST', body, credentials: 'include' })
      const data = await res.json()

      if (!res.ok) {
        setError(data?.errors?.[0]?.message || 'That image could not be uploaded.')
        return
      }

      setDraft((prev) => ({
        ...prev,
        heroImageId: data.doc?.id ?? null,
        heroImageUrl: data.doc?.sizes?.card?.url ?? data.doc?.url ?? null,
      }))
    } catch {
      setError('That image could not be uploaded. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function save(mode: 'draft' | 'submit') {
    const problem = validate(draft)
    if (problem) {
      setError(problem)
      setNotice(null)
      return
    }

    setSaving(mode)
    setError(null)
    setNotice(null)

    const payload = {
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      course: draft.course,
      cuisine: draft.cuisine || undefined,
      difficulty: draft.difficulty || undefined,
      servings: Number(draft.servings),
      prepMinutes: draft.prepMinutes ? Number(draft.prepMinutes) : undefined,
      cookMinutes: draft.cookMinutes ? Number(draft.cookMinutes) : undefined,
      chefTips: draft.chefTips.trim() || undefined,
      pairing: draft.pairing.trim() || undefined,
      allergens: draft.allergens.trim() || undefined,
      heroImage: draft.heroImageId ?? undefined,
      ingredients: draft.ingredients
        .filter((row) => row.product)
        .map((row) => ({
          product: row.product!.id,
          quantity: unitTakesQuantity(row.unit) ? Number(row.quantity) : undefined,
          unit: row.unit,
          preparation: row.preparation.trim() || undefined,
          section: row.section.trim() || undefined,
          variantSku: row.variantSku || undefined,
          optional: row.optional,
        })),
      method: draft.method
        .filter((step) => step.instruction.trim())
        .map((step) => ({
          instruction: step.instruction.trim(),
          timerMinutes: step.timerMinutes ? Number(step.timerMinutes) : undefined,
        })),
      // The server clamps this to draft or submitted for a chef regardless, so
      // sending it is a request rather than an instruction.
      status: mode === 'submit' ? 'submitted' : 'draft',
    }

    try {
      const res = await fetch(draft.id ? `/api/recipes/${draft.id}` : '/api/recipes', {
        method: draft.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data?.errors?.[0]?.message || 'We could not save that. Please try again.')
        return
      }

      const savedId = data?.doc?.id ?? draft.id
      if (mode === 'submit') {
        router.push('/portal/chef?submitted=1')
        router.refresh()
        return
      }

      setDraft((prev) => ({ ...prev, id: savedId, status: data?.doc?.status ?? 'draft' }))
      setNotice('Draft saved. Nobody but you can see it.')
      // A new recipe gets its own URL so a refresh does not lose the id.
      if (!draft.id && savedId) window.history.replaceState(null, '', `/portal/chef/recipes/${savedId}`)
    } catch {
      setError('Something went wrong on the way to us. Please try again.')
    } finally {
      setSaving(null)
    }
  }

  const editable = draft.status !== 'published' && draft.status !== 'archived'

  return (
    <div className="bg-cream min-h-[70vh]">
      <PortalMasthead
        eyebrow={draft.id ? 'Edit recipe' : 'New recipe'}
        title={draft.title.trim() || 'Untitled recipe'}
        lede="Every ingredient comes from our catalogue, with a quantity and a unit — so a reader can order exactly what you cooked with."
        back={{ href: '/portal/chef', label: 'Your recipes' }}
        aside={
          draft.id ? (
            <StatusChip
              label={draft.status === 'submitted' ? 'In review' : draft.status.replace('_', ' ')}
              tone={draft.status === 'submitted' ? 'progress' : 'neutral'}
            />
          ) : null
        }
      />

      <div className={cn(GUTTER, 'py-7 md:py-10')}>
        <div className="max-w-4xl flex flex-col gap-4">
          {error ? <Alert>{error}</Alert> : null}
          {notice ? <Alert tone="success">{notice}</Alert> : null}
          {draft.reviewFeedback && draft.status === 'changes_requested' ? (
            <Alert tone="info">
              <strong>Changes requested:</strong> {draft.reviewFeedback}
            </Alert>
          ) : null}
          {!editable ? (
            <Alert tone="info">
              This recipe is published, so it is now editorial content and cannot be edited here.
              Write to us with what needs changing and we will move it back to draft for you.
            </Alert>
          ) : null}

          {/* ── The dish ──────────────────────────────────────────── */}
          <PortalPanel title="The dish" blurb="What it is, and who it is for.">
            <FieldGrid>
              <Field label="Title" htmlFor="r-title" required span="full">
                <input
                  id="r-title"
                  className={fieldClass}
                  value={draft.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="Slow-roast lamb shoulder with preserved lemon"
                  disabled={!editable}
                />
              </Field>
              <Field
                label="Summary"
                htmlFor="r-summary"
                required
                span="full"
                hint="One or two sentences. This is the recipe card and the search result."
              >
                <textarea
                  id="r-summary"
                  className={areaClass}
                  value={draft.summary}
                  onChange={(e) => set('summary', e.target.value)}
                  rows={3}
                  disabled={!editable}
                />
              </Field>
              <Field label="Course" htmlFor="r-course" required>
                <SelectField
                  id="r-course"
                  value={draft.course}
                  onChange={(value) => set('course', value)}
                  options={RECIPE_COURSES}
                />
              </Field>
              <Field label="Cuisine" htmlFor="r-cuisine">
                <SelectField
                  id="r-cuisine"
                  value={draft.cuisine}
                  onChange={(value) => set('cuisine', value)}
                  options={CUISINES}
                />
              </Field>
              <Field label="Difficulty" htmlFor="r-difficulty">
                <SelectField
                  id="r-difficulty"
                  value={draft.difficulty}
                  onChange={(value) => set('difficulty', value)}
                  options={RECIPE_DIFFICULTY}
                  placeholder="Intermediate"
                />
              </Field>
              <Field label="Serves" htmlFor="r-servings" required hint="What the quantities below make.">
                <input
                  id="r-servings"
                  className={fieldClass}
                  value={draft.servings}
                  onChange={(e) => set('servings', e.target.value)}
                  inputMode="numeric"
                  disabled={!editable}
                />
              </Field>
              <Field label="Preparation (minutes)" htmlFor="r-prep">
                <input
                  id="r-prep"
                  className={fieldClass}
                  value={draft.prepMinutes}
                  onChange={(e) => set('prepMinutes', e.target.value)}
                  inputMode="numeric"
                  disabled={!editable}
                />
              </Field>
              <Field label="Cooking (minutes)" htmlFor="r-cook">
                <input
                  id="r-cook"
                  className={fieldClass}
                  value={draft.cookMinutes}
                  onChange={(e) => set('cookMinutes', e.target.value)}
                  inputMode="numeric"
                  disabled={!editable}
                />
              </Field>
            </FieldGrid>

            <Field label="Photograph of the dish" hint="JPEG, PNG, WebP or AVIF. Landscape works best.">
              <div className="flex flex-wrap items-center gap-4">
                {draft.heroImageUrl ? (
                  <span className="relative w-32 h-24 rounded-sm overflow-hidden bg-parchment shrink-0">
                    <Image
                      src={draft.heroImageUrl}
                      alt=""
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  </span>
                ) : null}
                <label
                  className={cn(
                    'inline-flex items-center h-11 px-5 rounded-sm border border-stone/30 bg-white transition-colors',
                    editable && !uploading
                      ? 'cursor-pointer hover:border-forest-green'
                      : 'opacity-60 cursor-not-allowed',
                  )}
                >
                  <span className="font-heading text-[11px] uppercase tracking-[0.16em] font-semibold text-obsidian">
                    {uploading ? 'Uploading…' : draft.heroImageUrl ? 'Replace photo' : 'Upload a photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="sr-only"
                    disabled={!editable || uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void uploadHero(file)
                      e.target.value = ''
                    }}
                  />
                </label>
              </div>
            </Field>
          </PortalPanel>

          {/* ── Ingredients ───────────────────────────────────────── */}
          <PortalPanel
            title="Ingredients"
            blurb="Search the catalogue for each one. There is no free-text line — that is the point: everything here is something a reader can put in a basket."
            footer={
              <p className="m-0! font-sans text-[11.5px] text-stone leading-relaxed">
                Cannot find something? Tell us what it is when you submit — a recipe that needs an
                ingredient we do not carry is useful information about what we should.
              </p>
            }
          >
            <div className="flex flex-col gap-3">
              {draft.ingredients.map((row, index) => (
                <RepeatableRow
                  key={index}
                  index={index}
                  label="Ingredient"
                  removable={draft.ingredients.length > 1 && editable}
                  onRemove={() =>
                    set(
                      'ingredients',
                      draft.ingredients.filter((_, i) => i !== index),
                    )
                  }
                >
                  <div className="flex flex-col gap-3">
                    {row.product ? (
                      <PickedProductChip
                        product={row.product}
                        onClear={
                          editable ? () => setIngredient(index, { product: null, variantSku: '' }) : undefined
                        }
                      />
                    ) : (
                      <ProductPicker
                        onPick={(product) => setIngredient(index, { product })}
                        placeholder="Search our catalogue — try “olive oil”, “saffron”, a brand or an SKU"
                      />
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Field label="Quantity" htmlFor={`r-qty-${index}`}>
                        <input
                          id={`r-qty-${index}`}
                          className={fieldClass}
                          value={row.quantity}
                          onChange={(e) => setIngredient(index, { quantity: e.target.value })}
                          inputMode="decimal"
                          disabled={!editable || !unitTakesQuantity(row.unit)}
                          placeholder={unitTakesQuantity(row.unit) ? '250' : '—'}
                        />
                      </Field>
                      <Field label="Unit" htmlFor={`r-unit-${index}`}>
                        <UnitSelect
                          id={`r-unit-${index}`}
                          value={row.unit}
                          onChange={(unit) => setIngredient(index, { unit })}
                        />
                      </Field>
                      <Field label="Preparation" htmlFor={`r-prep-${index}`}>
                        <input
                          id={`r-prep-${index}`}
                          className={fieldClass}
                          value={row.preparation}
                          onChange={(e) => setIngredient(index, { preparation: e.target.value })}
                          placeholder="finely chopped"
                          disabled={!editable}
                        />
                      </Field>
                      <Field label="Group" htmlFor={`r-section-${index}`}>
                        <input
                          id={`r-section-${index}`}
                          className={fieldClass}
                          value={row.section}
                          onChange={(e) => setIngredient(index, { section: e.target.value })}
                          placeholder="For the sauce"
                          disabled={!editable}
                        />
                      </Field>
                    </div>

                    {row.product?.variants && row.product.variants.length > 1 ? (
                      <Field
                        label="Pack size used"
                        htmlFor={`r-variant-${index}`}
                        hint="Optional — only when the size genuinely changes the result."
                      >
                        <SelectField
                          id={`r-variant-${index}`}
                          value={row.variantSku}
                          onChange={(variantSku) => setIngredient(index, { variantSku })}
                          options={row.product.variants.map((variant) => ({
                            label: variant.size,
                            value: variant.sku,
                          }))}
                          placeholder="Any size"
                        />
                      </Field>
                    ) : null}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <CheckboxRow
                        id={`r-optional-${index}`}
                        checked={row.optional}
                        onChange={(optional) => setIngredient(index, { optional })}
                        label="Optional ingredient"
                      />
                      {row.product ? (
                        <span className="font-sans text-[11.5px] text-stone">
                          Reads as:{' '}
                          <span className="text-obsidian">
                            {formatIngredientAmount(Number(row.quantity) || null, row.unit)}{' '}
                            {row.product.title}
                            {row.preparation ? `, ${row.preparation}` : ''}
                          </span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </RepeatableRow>
              ))}

              {editable && draft.ingredients.length < MAX_INGREDIENTS ? (
                <AddRowButton
                  onClick={() => set('ingredients', [...draft.ingredients, emptyIngredient()])}
                >
                  Add another ingredient
                </AddRowButton>
              ) : null}
            </div>
          </PortalPanel>

          {/* ── Method ────────────────────────────────────────────── */}
          <PortalPanel title="Method" blurb="One instruction per step. Write it the way you would say it.">
            <div className="flex flex-col gap-3">
              {draft.method.map((step, index) => (
                <RepeatableRow
                  key={index}
                  index={index}
                  label="Step"
                  removable={draft.method.length > 1 && editable}
                  onRemove={() =>
                    set(
                      'method',
                      draft.method.filter((_, i) => i !== index),
                    )
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-3">
                      <Field label="Instruction" htmlFor={`r-step-${index}`}>
                        <textarea
                          id={`r-step-${index}`}
                          className={areaClass}
                          value={step.instruction}
                          onChange={(e) => setStep(index, { instruction: e.target.value })}
                          rows={3}
                          disabled={!editable}
                        />
                      </Field>
                    </div>
                    <Field
                      label="Timer (minutes)"
                      htmlFor={`r-timer-${index}`}
                      hint="Optional. Shows a timer beside the step."
                    >
                      <input
                        id={`r-timer-${index}`}
                        className={fieldClass}
                        value={step.timerMinutes}
                        onChange={(e) => setStep(index, { timerMinutes: e.target.value })}
                        inputMode="numeric"
                        disabled={!editable}
                      />
                    </Field>
                  </div>
                </RepeatableRow>
              ))}

              {editable && draft.method.length < MAX_STEPS ? (
                <AddRowButton onClick={() => set('method', [...draft.method, emptyStep()])}>
                  Add another step
                </AddRowButton>
              ) : null}
            </div>
          </PortalPanel>

          {/* ── Finishing ─────────────────────────────────────────── */}
          <PortalPanel title="Finishing notes" blurb="Everything here is optional, and all of it helps.">
            <FieldGrid>
              <Field
                label="Chef’s notes"
                htmlFor="r-tips"
                span="full"
                hint="What you would tell someone standing next to you."
              >
                <textarea
                  id="r-tips"
                  className={areaClass}
                  value={draft.chefTips}
                  onChange={(e) => set('chefTips', e.target.value)}
                  rows={3}
                  disabled={!editable}
                />
              </Field>
              <Field label="Serving and pairing" htmlFor="r-pairing" span="full">
                <textarea
                  id="r-pairing"
                  className={areaClass}
                  value={draft.pairing}
                  onChange={(e) => set('pairing', e.target.value)}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field
                label="Allergens"
                htmlFor="r-allergens"
                span="full"
                hint="Anything beyond what the products themselves declare."
              >
                <textarea
                  id="r-allergens"
                  className={areaClass}
                  value={draft.allergens}
                  onChange={(e) => set('allergens', e.target.value)}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
            </FieldGrid>
          </PortalPanel>

          {editable ? (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="font-sans text-[11.5px] text-stone leading-relaxed max-w-md">
                Submitting puts this in our review queue. We usually come back within a few working
                days, and nothing is published until we do.
              </span>
              <div className="flex flex-wrap gap-3">
                <GhostButton onClick={() => save('draft')} disabled={saving !== null}>
                  {saving === 'draft' ? 'Saving…' : 'Save draft'}
                </GhostButton>
                <PrimaryButton onClick={() => save('submit')} disabled={saving !== null}>
                  {saving === 'submit' ? 'Submitting…' : 'Submit for review'}
                </PrimaryButton>
              </div>
            </div>
          ) : null}

          {draft.course ? (
            <p className="m-0! font-sans text-[11.5px] text-stone/80">
              Filed under {labelFor(RECIPE_COURSES, draft.course)}
              {draft.cuisine ? ` · ${labelFor(CUISINES, draft.cuisine)}` : ''}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
