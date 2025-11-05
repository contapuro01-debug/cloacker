export default function PoliticaPrivacidadePage() {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Política de Privacidade</h1>

        <div className="space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Informações que Coletamos</h2>
            <p>
              Coletamos informações que você nos fornece diretamente, como nome, e-mail e outras informações de contato
              quando você interage com nosso site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Como Usamos suas Informações</h2>
            <p>
              Utilizamos as informações coletadas para melhorar nossos serviços, responder às suas solicitações e enviar
              comunicações relevantes sobre nossos produtos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Compartilhamento de Informações</h2>
            <p>
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto quando necessário
              para fornecer nossos serviços ou quando exigido por lei.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Segurança</h2>
            <p>
              Implementamos medidas de segurança adequadas para proteger suas informações pessoais contra acesso não
              autorizado, alteração, divulgação ou destruição.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Seus Direitos</h2>
            <p>
              Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento. Entre em
              contato conosco através do e-mail fornecido para exercer esses direitos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Contato</h2>
            <p>
              Para questões sobre esta política de privacidade, entre em contato através do e-mail:{" "}
              <a href="mailto:atendimento.online@gmail.com" className="text-[#00ff00] hover:underline">
                atendimento.online@gmail.com
              </a>
            </p>
          </section>

          <section className="pt-4">
            <p className="text-sm text-gray-400">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-[#00ff00] text-black font-semibold rounded-full hover:bg-[#00dd00] transition-colors"
          >
            Voltar para o site
          </a>
        </div>
      </div>
    </main>
  )
}
