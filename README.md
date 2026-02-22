[README.md](https://github.com/user-attachments/files/25462803/README.md)
# DropCircles

Closed-circuit infrastructure for artists. Zero leaks. Zero algorithms. Direct-to-vault drops.

---

## Stack
- **Next.js 14** (App Router)
- **Supabase** — Auth, Postgres DB, Storage
- **EmailJS** — Fan join notifications to artist
- **Tailwind CSS**

---

## Environment Variables

Create a `.env.local` file in the root with the following:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# EmailJS — Fan join notifications
# Get these from https://www.emailjs.com/
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

### EmailJS Template Setup

In your EmailJS template, use these variables:
- `{{fan_email}}` — The fan's email address
- `{{circle_name}}` — Name of the DropCircle they joined
- `{{spots_remaining}}` — How many spots are left
- `{{timestamp}}` — When they joined (Eastern Time)

**Suggested subject:** `🔔 New fan joined {{circle_name}}`

**Suggested body:**
```
Someone just claimed a spot in your vault.

Circle: {{circle_name}}
Fan: {{fan_email}}
Spots remaining: {{spots_remaining}}
Time: {{timestamp}}

— DropCircles
```

---

## Supabase Schema

### `access_keys`
| column | type |
|---|---|
| id | uuid |
| code | text (unique) |
| max_uses | int |
| current_uses | int |

### `circles`
| column | type |
|---|---|
| id | uuid |
| artist_id | uuid (references auth.users) |
| title | text |
| is_live | boolean |
| max_capacity | int |
| claimed_spots | int |
| created_at | timestamp |

### `artifacts`
| column | type |
|---|---|
| id | uuid |
| circle_id | uuid (references circles) |
| title | text |
| file_path | text |
| file_type | text |
| created_at | timestamp |

### `fan_roster`
| column | type |
|---|---|
| id | uuid |
| circle_id | uuid (references circles) |
| email | text |
| created_at | timestamp |

**Index:** unique on `(circle_id, email)` to prevent duplicate entries.

### Supabase Storage
Create a private bucket called `vault`. Artifacts are served via 15-minute signed URLs.

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing — beta key unlock or waitlist |
| `/artist` | Artist login |
| `/artist/hub` | Artist dashboard — manage circles, upload, guestlist |
| `/drop/[circleId]` | Fan-facing vault page |
| `/vault` | Legacy standalone upload page |

---

## Download Protection

The fan drop page (`/drop/[circleId]`) includes multiple layers:
1. **15-minute signed URLs** (down from 60 min) — links expire quickly
2. **Email watermark** rendered on top of every audio/video card
3. **Right-click disabled** via `onContextMenu` on all media elements and the page body
4. **`controlsList="nodownload"`** + `disablePictureInPicture` on video elements
5. **`user-select: none`** on media containers

> Note: None of these methods are 100% bulletproof against a determined user with dev tools. They serve as strong deterrents for casual sharing.

---

## Developer Notes

- The hardcoded `EIGHT` bypass key has been removed from the landing page. Use a real key in the `access_keys` table.
- The hidden artist backdoor link remains at the bottom-right of the landing page (opacity-0, hover to reveal).
- Artist accounts must be created directly in Supabase Auth (invite-only by design).
