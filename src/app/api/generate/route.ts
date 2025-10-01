import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const huggingfaceToken = process.env.HUGGINGFACE_API_TOKEN;

export async function POST(request: NextRequest) {
  try {
    // Get auth token from request
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Verify user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get request data
    const formData = await request.formData();
    const prompt = formData.get("prompt") as string;
    const style = formData.get("style") as string;
    const image = formData.get("image") as File | null;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Check credits
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("remaining_credits")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    if (profile.remaining_credits < 1) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    // Generate image with Hugging Face
    let generatedImageBlob: Blob;

    if (image) {
      // Image-to-Image
      generatedImageBlob = await generateImageToImage(prompt, style, image);
    } else {
      // Text-to-Image
      generatedImageBlob = await generateTextToImage(prompt, style);
    }

    // Upload to Supabase Storage
    const timestamp = Date.now();
    const fileName = `${user.id}/${timestamp}.png`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, generatedImageBlob, {
        contentType: "image/png",
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(fileName);

    console.log("Generated image URL:", publicUrl);

    // Decrement credits
    const { data: creditResult, error: creditError } = await supabase.rpc(
      "decrement_credits",
      { user_id_input: user.id }
    );

    if (creditError || !creditResult?.success) {
      console.error("Credit error:", creditError);
      return NextResponse.json(
        { error: "Failed to update credits" },
        { status: 500 }
      );
    }

    // Save to generations table
    const { error: insertError } = await supabase.from("generations").insert({
      user_id: user.id,
      prompt,
      style_chosen: style,
      image_url: publicUrl,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
    }

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      remainingCredits: creditResult.remaining_credits,
    });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Hugging Face API functions
async function generateTextToImage(
  prompt: string,
  style: string
): Promise<Blob> {
  const stylePrompts: Record<string, string> = {
    realistic: "photorealistic, detailed, high quality, 8k",
    anime: "anime style, manga, vibrant colors",
    "digital-art": "digital art, artstation, concept art",
    "oil-painting": "oil painting, classical art, textured",
    watercolor: "watercolor painting, soft colors, artistic",
    "3d-render": "3d render, octane render, cinema 4d, detailed",
  };

  const fullPrompt = `${prompt}, ${stylePrompts[style] || "high quality"}`;

  if (!huggingfaceToken) {
    throw new Error("Hugging Face API token is not configured");
  }

  const response = await fetch(
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${huggingfaceToken}`,
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        options: { wait_for_model: true },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Hugging Face Text-to-Image error:", errorText);
    throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
  }

  return await response.blob();
}

async function generateImageToImage(
  prompt: string,
  style: string,
  _image: File
): Promise<Blob> {
  // For now, just do text-to-image ignoring the uploaded image
  // Image-to-Image requires different API setup or paid service
  console.log("Note: Using text-to-image instead of image-to-image (uploaded image ignored)");
  return await generateTextToImage(prompt, style);
}
