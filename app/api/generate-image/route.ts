import { type NextRequest, NextResponse } from "next/server"

// Define types for the API
type NovitaRequestBody = {
  extra: {
    response_image_type: string
  }
  request: {
    prompt: string
    model_name: string
    negative_prompt?: string
    width: number
    height: number
    image_num: number
    steps: number
    seed: number
    sampler_name: string
    guidance_scale: number
  }
}

type NovitaTaskResponse = {
  task_id: string
}

type NovitaTaskResultResponse = {
  task: {
    task_id: string
    status: string
    reason: string
  }
  images: {
    image_url: string
    image_type: string
  }[]
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, negativePrompt, imageCount, width, height } = await req.json()

    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_NOVITA_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Create request body for Novita API
    const requestBody: NovitaRequestBody = {
      extra: {
        response_image_type: "jpeg",
      },
      request: {
        prompt: prompt,
        model_name: "sd_xl_base_1.0.safetensors", // Using SDXL as default
        negative_prompt: negativePrompt || "nsfw, bad quality, worst quality, low quality",
        width: width || 1024,
        height: height || 1024,
        image_num: imageCount || 1,
        steps: 20,
        seed: -1,
        sampler_name: "Euler a",
        guidance_scale: 7.5,
      },
    }

    // Make request to Novita API to start generation
    const response = await fetch("https://api.novita.ai/v3/async/txt2img", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Novita API error:", errorData)
      return NextResponse.json({ error: "Failed to generate image" }, { status: response.status })
    }

    const data = (await response.json()) as NovitaTaskResponse

    // Return the task ID to the client
    return NextResponse.json({ taskId: data.task_id })
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
