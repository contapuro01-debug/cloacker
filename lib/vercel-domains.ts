interface VercelDomainResponse {
  name: string
  apexName: string
  projectId: string
  verified: boolean
  verification?: {
    type: string
    domain: string
    value: string
    reason: string
  }[]
}

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID?.trim() || undefined

/**
 * Adiciona um domínio personalizado ao projeto Vercel
 */
export async function addDomainToVercel(
  domain: string,
): Promise<{ success: boolean; error?: string; data?: VercelDomainResponse }> {
  console.log("[GhostLayer] Tentando adicionar domínio:", domain)
  console.log("[GhostLayer] VERCEL_API_TOKEN configurado:", !!VERCEL_API_TOKEN)
  console.log("[GhostLayer] VERCEL_PROJECT_ID:", VERCEL_PROJECT_ID)
  console.log("[GhostLayer] VERCEL_TEAM_ID:", VERCEL_TEAM_ID ? VERCEL_TEAM_ID : "não configurado (conta pessoal)")

  if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
    return {
      success: false,
      error: "Configuração do Vercel incompleta. Configure VERCEL_API_TOKEN e VERCEL_PROJECT_ID.",
    }
  }

  try {
    const url =
      VERCEL_TEAM_ID && VERCEL_TEAM_ID.length > 0
        ? `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains?teamId=${VERCEL_TEAM_ID}`
        : `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains`

    console.log("[GhostLayer] URL da API:", url)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: domain,
      }),
    })

    const data = await response.json()

    console.log("[GhostLayer] Status da resposta:", response.status)
    console.log("[GhostLayer] Resposta completa:", JSON.stringify(data, null, 2))

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || data.message || "Erro ao adicionar domínio no Vercel",
      }
    }

    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error("[GhostLayer] Erro ao adicionar domínio:", error)
    return {
      success: false,
      error: "Erro ao conectar com a API do Vercel",
    }
  }
}

/**
 * Remove um domínio do projeto Vercel
 */
export async function removeDomainFromVercel(domain: string): Promise<{ success: boolean; error?: string }> {
  if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
    return {
      success: false,
      error: "Configuração do Vercel incompleta",
    }
  }

  try {
    const url =
      VERCEL_TEAM_ID && VERCEL_TEAM_ID.length > 0
        ? `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains/${domain}?teamId=${VERCEL_TEAM_ID}`
        : `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains/${domain}`

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${VERCEL_API_TOKEN}`,
      },
    })

    if (!response.ok) {
      const data = await response.json()
      return {
        success: false,
        error: data.error?.message || "Erro ao remover domínio",
      }
    }

    return { success: true }
  } catch (error) {
    console.error("[GhostLayer] Erro ao remover domínio:", error)
    return {
      success: false,
      error: "Erro ao conectar com a API do Vercel",
    }
  }
}

/**
 * Verifica o status de um domínio no Vercel
 */
export async function verifyDomainInVercel(
  domain: string,
): Promise<{ success: boolean; verified: boolean; error?: string; data?: VercelDomainResponse }> {
  if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
    return {
      success: false,
      verified: false,
      error: "Configuração do Vercel incompleta",
    }
  }

  try {
    const url =
      VERCEL_TEAM_ID && VERCEL_TEAM_ID.length > 0
        ? `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains/${domain}?teamId=${VERCEL_TEAM_ID}`
        : `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains/${domain}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${VERCEL_API_TOKEN}`,
      },
    })

    if (!response.ok) {
      const data = await response.json()
      return {
        success: false,
        verified: false,
        error: data.error?.message || "Domínio não encontrado",
      }
    }

    const data = await response.json()

    return {
      success: true,
      verified: data.verified || false,
      data: data,
    }
  } catch (error) {
    console.error("[GhostLayer] Erro ao verificar domínio:", error)
    return {
      success: false,
      verified: false,
      error: "Erro ao conectar com a API do Vercel",
    }
  }
}
