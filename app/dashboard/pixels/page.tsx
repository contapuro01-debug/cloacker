import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PixelConfigForm } from "@/components/pixel-config-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function PixelsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: campaigns } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Pixels & Tracking</h1>
        <p className="text-slate-400 mt-1">Configure pixels e APIs de conversão para suas campanhas</p>
      </div>

      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Configuração de Pixels por Campanha</CardTitle>
          <CardDescription className="text-slate-400">
            Selecione uma campanha abaixo para configurar seus pixels de tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns && campaigns.length > 0 ? (
            <Tabs defaultValue={campaigns[0].id} className="w-full">
              <TabsList className="bg-slate-900 border-slate-700 flex-wrap h-auto">
                {campaigns.map((campaign) => (
                  <TabsTrigger
                    key={campaign.id}
                    value={campaign.id}
                    className="data-[state=active]:bg-[#00ff9d] data-[state=active]:text-slate-900"
                  >
                    {campaign.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {campaigns.map((campaign) => (
                <TabsContent key={campaign.id} value={campaign.id} className="mt-6">
                  <PixelConfigForm campaignId={campaign.id} />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">Nenhuma campanha encontrada. Crie uma campanha primeiro.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
