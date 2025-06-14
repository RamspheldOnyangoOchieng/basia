import { type NextRequest, NextResponse } from "next/server"

// Define types for the API
type NovitaImg2ImgRequestBody = {
  extra: {
    response_image_type: string
  }
  request: {
    model_name: string
    prompt: string
    negative_prompt?: string
    height: number
    width: number
    image_num: number
    steps: number
    seed: number
    clip_skip: number
    guidance_scale: number
    sampler_name: string
    image_base64: string
  }
}

type NovitaTaskResponse = {
  task_id: string
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, negativePrompt, imageBase64 } = await req.json()

    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_NOVITA_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Validate base64 image
    if (!imageBase64 || typeof imageBase64 !== "string") {
      console.error("Invalid image base64:", imageBase64 ? "Not a string" : "Empty")
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 })
    }

    // Ensure the base64 string is properly formatted
    // The API expects a base64 string without the data URL prefix
    let processedBase64 = imageBase64
    if (imageBase64.includes("base64,")) {
      processedBase64 = imageBase64.split("base64,")[1]
    }

    // Log the first 50 characters of the base64 string for debugging
    console.log("Base64 image prefix:", processedBase64.substring(0, 50) + "...")
    console.log("Base64 image length:", processedBase64.length)

    // Create request body for Novita API with the specified parameters
    const requestBody: NovitaImg2ImgRequestBody = {
      extra: {
        response_image_type: "jpeg",
      },
      request: {
        prompt: prompt,
        model_name: "sd_xl_base_1.0.safetensors", // Using SDXL as default
        negative_prompt: negativePrompt || "bad quality, worst quality, low quality",
        width: 384,
        height: 512,
        image_num: 1,
        steps: 20,
        seed: -1,
        clip_skip: 1,
        guidance_scale: 7.5,
        sampler_name: "Euler a",
        image_base64: processedBase64,
      },
    }

    // Make request to Novita API to start generation
    console.log("Sending request to Novita API...")
    const response = await fetch("https://api.novita.ai/v3/async/img2img", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    // Log the response status
    console.log("Novita API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Novita API error:", errorText)
      try {
        // Try to parse the error as JSON
        const errorData = JSON.parse(errorText)
        return NextResponse.json(
          {
            error: "Failed to generate image",
            details: errorData,
          },
          { status: response.status },
        )
      } catch (e) {
        // If parsing fails, return the raw error text
        return NextResponse.json(
          {
            error: "Failed to generate image",
            details: errorText,
          },
          { status: response.status },
        )
      }
    }

    // Parse the response
    const responseText = await response.text()
    console.log("Novita API raw response:", responseText)

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      console.error("Failed to parse API response as JSON:", e)
      return NextResponse.json(
        {
          error: "Invalid API response format",
          details: "The API response was not valid JSON",
        },
        { status: 500 },
      )
    }

    console.log("Novita API parsed response:", JSON.stringify(responseData))

    // Try to extract the task_id from different possible response structures
    let taskId = null

    // Check for the expected structure first
    if (responseData?.data?.task_id) {
      taskId = responseData.data.task_id
    }
    // Check for alternative structures
    else if (responseData?.task_id) {
      taskId = responseData.task_id
    } else if (responseData?.id) {
      taskId = responseData.id
    }
    // If we have a data object but no task_id, log all keys to help debug
    else if (responseData?.data) {
      console.log("Response data keys:", Object.keys(responseData.data))
      // Try to find any key that might contain "id" or "task"
      for (const key of Object.keys(responseData.data)) {
        if (key.includes("id") || key.includes("task")) {
          taskId = responseData.data[key]
          console.log(`Found potential task ID in key ${key}:`, taskId)
          break
        }
      }
    }

    // If we still don't have a task ID, check the top level object
    if (!taskId && responseData) {
      console.log("Top level response keys:", Object.keys(responseData))
      // Try to find any key that might contain "id" or "task"
      for (const key of Object.keys(responseData)) {
        if (key.includes("id") || key.includes("task")) {
          taskId = responseData[key]
          console.log(`Found potential task ID in top level key ${key}:`, taskId)
          break
        }
      }
    }

    // If we found a task ID, return it
    if (taskId) {
      console.log("Found task ID:", taskId)
      return NextResponse.json({ taskId })
    }

    // If we couldn't find a task ID, return an error with the full response for debugging
    console.error("Could not find task_id in response:", responseData)
    return NextResponse.json(
      {
        error: "Invalid API response",
        details: "The API response did not contain the expected task_id",
        response: responseData,
      },
      { status: 500 },
    )
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: String(error),
      },
      { status: 500 },
    )
  }
}
