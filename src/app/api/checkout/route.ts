import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Stripe configuration (დაგჭირდებათ: npm install stripe)
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { priceId, credits } = await request.json();

    // TODO: Stripe Checkout Session-ის შექმნა
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: [{
    //     price: priceId,
    //     quantity: 1,
    //   }],
    //   mode: 'payment',
    //   success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?payment=success`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?payment=cancel`,
    //   client_reference_id: user.id,
    //   metadata: {
    //     userId: user.id,
    //     credits: credits.toString(),
    //   },
    // });

    // return NextResponse.json({ url: session.url });

    // დროებით - ტესტირებისთვის უშუალოდ დავამატოთ კრედიტები
    console.log(`[TEST MODE] Adding ${credits} credits to user ${user.id}`);
    
    const { data, error } = await supabase.rpc("add_credits", {
      user_id_input: user.id,
      credits_to_add: credits,
    });

    if (error) {
      console.error("Error adding credits:", error);
      return NextResponse.json(
        { error: "Failed to add credits" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `${credits} კრედიტი დაემატა`,
      remainingCredits: data.remaining_credits 
    });

  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Payment failed" },
      { status: 500 }
    );
  }
}
