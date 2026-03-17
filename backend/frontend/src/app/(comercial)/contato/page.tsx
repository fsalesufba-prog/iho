import { Contato } from '@/components/landing/Contato'

export const metadata = {
  title: 'Contato - IHO',
  description: 'Entre em contato com a equipe IHO. Tire suas dúvidas ou agende uma demonstração.',
}

export default function ContatoPage() {
  return (
    <div className="min-h-screen py-12">
      <Contato />
    </div>
  )
}
