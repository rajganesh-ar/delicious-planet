'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { NavCard, NavColumn, NavPanel } from '@/lib/nav'

/**
 * Dropdown panels for the desktop navbar.
 *
 * Note on colour: styles.css declares an unlayered `a { color: currentColor }`
 * rule that outranks Tailwind's layered text utilities, so every link paints its
 * colour on a child <span> rather than on the anchor itself.
 */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const panelMotion = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.22, ease: EASE },
}

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <span className="block font-heading text-[10px] uppercase tracking-[0.18em] font-semibold text-forest-green mb-3">
      {children}
    </span>
  )
}

function PanelLink({ href, label, onNavigate }: { href: string; label: string; onNavigate: () => void }) {
  return (
    <li className="m-0">
      <Link href={href} onClick={onNavigate} className="group flex items-center gap-1.5 py-1.25 no-underline">
        <span className="w-0 group-hover:w-2.5 h-px bg-forest-green transition-all duration-300" />
        <span className="font-sans text-[13px] leading-snug text-stone group-hover:text-forest-green transition-colors">
          {label}
        </span>
      </Link>
    </li>
  )
}

function LinkColumn({ column, onNavigate }: { column: NavColumn; onNavigate: () => void }) {
  return (
    <div className="min-w-0">
      <ColumnHeading>{column.heading}</ColumnHeading>
      <ul className="list-none m-0 p-0">
        {column.links.map((link) => (
          <PanelLink key={link.href + link.label} href={link.href} label={link.label} onNavigate={onNavigate} />
        ))}
      </ul>
    </div>
  )
}

function ImageCard({
  card,
  onNavigate,
  ratio = 'aspect-4/3',
  sizes = '(max-width: 1280px) 25vw, 300px',
}: {
  card: NavCard
  onNavigate: () => void
  ratio?: string
  sizes?: string
}) {
  return (
    <Link
      href={card.href}
      onClick={onNavigate}
      className={`group relative block overflow-hidden rounded-sm bg-charcoal no-underline ${ratio}`}
    >
      {card.image && (
        <Image
          src={card.image}
          alt=""
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/55 to-obsidian/5" />

      <div className="absolute inset-0 z-10 flex flex-col justify-end p-3.5">
        {card.eyebrow && (
          <span className="block font-heading text-[9px] uppercase tracking-[0.18em] text-gold">
            {card.eyebrow}
          </span>
        )}
        <span className="block font-luxury text-cream text-[15px] font-semibold leading-tight mt-1">
          {card.label}
        </span>
        {card.caption && (
          <span className="block font-sans text-[11px] leading-snug text-cream/70 mt-1 line-clamp-2">
            {card.caption}
          </span>
        )}
        <span className="mt-2.5 inline-flex items-center gap-1.5">
          <span className="font-heading text-[9px] uppercase tracking-[0.16em] font-semibold text-cream/85 group-hover:text-gold transition-colors">
            Shop now
          </span>
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
            className="text-cream/85 group-hover:text-gold transition-colors"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  )
}

function PanelFooter({ panel, onNavigate }: { panel: NavPanel; onNavigate: () => void }) {
  if (!panel.cta && !panel.chips) return null

  return (
    <div className="mt-6 pt-4 border-t border-mist flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      {panel.chips ? (
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="font-heading text-[9px] uppercase tracking-[0.18em] text-stone/70 mr-1">
            {panel.chips.heading}
          </span>
          {panel.chips.links.map((chip) => (
            <Link
              key={chip.href}
              href={chip.href}
              onClick={onNavigate}
              className="group no-underline inline-flex items-center h-7 px-3 rounded-pill border border-mist bg-parchment hover:border-forest-green hover:bg-forest-green transition-colors"
            >
              <span className="font-sans text-[11px] text-stone group-hover:text-cream transition-colors">
                {chip.label}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <span />
      )}

      {panel.cta && (
        <Link href={panel.cta.href} onClick={onNavigate} className="group inline-flex items-center gap-2 no-underline">
          <span className="font-heading text-[10px] uppercase tracking-[0.16em] font-semibold text-forest-green">
            {panel.cta.label}
          </span>
          <span className="w-6 h-6 rounded-pill border border-forest-green/40 flex items-center justify-center text-forest-green transition-colors group-hover:bg-forest-green group-hover:text-cream">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      )}
    </div>
  )
}

/** Full-bleed panel that drops from the whole nav row (`mega` and `cards`). */
export function MegaPanel({
  panel,
  onNavigate,
  id,
}: {
  panel: NavPanel
  onNavigate: () => void
  id: string
}) {
  return (
    <motion.div
      id={id}
      {...panelMotion}
      className="absolute left-0 right-0 top-full z-10 bg-cream border-t border-mist shadow-[0_24px_40px_-24px_rgba(0,0,0,0.28)]"
    >
      <div className="px-6 lg:px-16 py-7">
        {panel.kind === 'cards' ? (
          <div className="grid grid-cols-3 xl:grid-cols-5 gap-3.5">
            {panel.cards?.map((card) => (
              <ImageCard
                key={card.href}
                card={card}
                onNavigate={onNavigate}
                sizes="(max-width: 1280px) 30vw, 18vw"
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-8 xl:gap-10">
            {/* Column count follows the data — brand and collection columns only
                appear once those tables are populated. */}
            <div
              style={{ '--nav-cols': panel.columns?.length ?? 1 } as React.CSSProperties}
              className="flex-1 grid grid-cols-3 gap-x-7 gap-y-6 xl:[grid-template-columns:repeat(var(--nav-cols),minmax(0,1fr))]"
            >
              {panel.columns?.map((column, i) => (
                <LinkColumn key={column.heading + i} column={column} onNavigate={onNavigate} />
              ))}
            </div>

            {panel.cards && panel.cards.length > 0 && (
              <div className="w-70 xl:w-84 shrink-0 hidden xl:block">
                {panel.cardsHeading && <ColumnHeading>{panel.cardsHeading}</ColumnHeading>}
                <div className="grid grid-cols-2 gap-3">
                  {panel.cards.map((card) => (
                    <ImageCard key={card.href} card={card} onNavigate={onNavigate} ratio="aspect-3/4" sizes="170px" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <PanelFooter panel={panel} onNavigate={onNavigate} />
      </div>
    </motion.div>
  )
}

/** Compact dropdown anchored to a single nav item (`list`). */
export function ListPanel({
  panel,
  onNavigate,
  id,
}: {
  panel: NavPanel
  onNavigate: () => void
  id: string
}) {
  return (
    <motion.div
      id={id}
      {...panelMotion}
      className="absolute left-0 top-full z-10 min-w-56 bg-cream border border-mist rounded-sm shadow-[0_20px_36px_-20px_rgba(0,0,0,0.32)] p-4"
    >
      {panel.columns?.map((column, i) => (
        <LinkColumn key={column.heading + i} column={column} onNavigate={onNavigate} />
      ))}
    </motion.div>
  )
}
