# Deployment Configuration Reference Guide

This document contains all the essential Environment Variables, API Keys, and Redirect URLs you need to configure for your Membership Project to work flawlessly in production. Keep this safely stored for future reference.

---

## 1. Vercel Environment Variables

You must add these exact keys and values to your project settings in Vercel (`Project Dashboard` > `Settings` > `Environment Variables`). 

| Variable Name | Value / Description | Safe to be Public? |
|--------------|---------------------|-------------------|
| `NEXT_PUBLIC_SITE_URL` | Your live Vercel domain (e.g., `https://my-app.vercel.app`) | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://nssifhykatnfvhfoacek.supabase.co` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_AlqHhkY3LWqv1ulXKxohCQ_NWTJQ2Pk` | Yes |
| `NEXT_PUBLIC_SUMUP_KEY` | `sup_pk_2YkeGT93R6tduwWbNHgE2DkcYXrSRn7Co` (SumUp Public Key) | Yes |
| `NEXT_PUBLIC_SUMUP_MERCHANT_CODE` | `MEPH624S` | Yes |
| `NEXT_PUBLIC_SUMUP_MERCHANT_EMAIL` | `madrasah@eeis.co.uk` | Yes |
| `SUMUP_SECRET_KEY` | `sup_sk_YQoK...` (Your SumUp Secret Key) | **NO! Keep Private** |

> **Note:** Vercel might ask if variables starting with `NEXT_PUBLIC_` are safe to expose. You must confirm **Yes**, as they need to be accessible by the browser to build features like the SumUp payment widget and Supabase login.

---

## 2. Supabase Configuration

Supabase handles your user authentication. It needs to know which domains are "allowed" to make requests and where to redirect users after they log in.

Go to your Supabase Project: `Authentication` > `URL Configuration`.

### Site URL
The base URL of your application.
- **Value:** `https://my-app.vercel.app` *(Replace with your real live Vercel domain)*

### Redirect URLs
Supabase will only redirect users back to these specific URLs after a successful login. Click **Add URL** for each of these:
1. `http://localhost:3000/**` *(Allows your local frontend to work)*
2. `https://my-app.vercel.app/api/auth/callback` *(Crucial for your live site's Google/Email login)*
3. `https://my-app.vercel.app/**` *(Acts as a wildcard for safe navigation)*

---

## 3. Google OAuth Configuration (Google Login)

If you are using Google Login, Google needs to be told exactly where to send the user back to after they click their Google account. 

Go to the [Google Cloud Console](https://console.cloud.google.com/) > `APIs & Services` > `Credentials`.

Edit your **OAuth 2.0 Web Client**.

### Authorized JavaScript origins
The base domains making the request.
1. `http://localhost:3000`
2. `https://my-app.vercel.app` *(Your Vercel domain)*

### Authorized redirect URIs
The exact paths where Google is allowed to send the user after login.
1. `https://nssifhykatnfvhfoacek.supabase.co/auth/v1/callback` *(Crucial Supabase internal receiver)*

---

## What to do when moving to a Custom Domain?
If you ever buy a custom domain (e.g., `www.eeismadrasah.co.uk`) and attach it to Vercel, you must come back to this list and replace `https://my-app.vercel.app` with `https://www.eeismadrasah.co.uk` across all three of the areas mentioned above (Vercel, Supabase, Google).
