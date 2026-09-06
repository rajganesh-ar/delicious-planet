import { RecipeEditor } from '@/components/sections/portal/RecipeEditor'

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <RecipeEditor id={id} />
}
