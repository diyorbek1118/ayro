# AYRO — visitka sayt

AYRO studiyasining bir sahifali sayti: xizmatlar, yechimlar, ish jarayoni, savollar va ariza formasi.
Framework yo‘q — oddiy HTML, CSS va JavaScript. Build qadami kerak emas.

Sayt: https://diyorbek1118.github.io/ayro/

## Fayllar

| Fayl | Nima |
| --- | --- |
| `index.html` | Sahifa, matnlar, SEO meta va structured data |
| `styles.css` | Dizayn |
| `main.js` | Menyu, animatsiya, ariza formasi, tashriflar hisoblagichi, loyihalar bloki |
| `stat/index.html` | Parolli statistika sahifasi (qidiruv tizimlariga yopiq) |
| `fonts/` | Inter va Inter Tight (saytning o‘zida) |
| `og.png` | Telegram/Facebook’da havola ulashilganda chiqadigan rasm |

## Statistika

`https://diyorbek1118.github.io/ayro/stat/` — parol bilan kiriladi. Ko‘rsatiladi:
jami va noyob tashriflar, bugungi tashriflar, 14 kunlik grafik, Telegram/telefon/email tugmalari
bosilishi, yuborilgan arizalar va qaysi havola orqali kelishgani.

Banner va postlarga maxsus havolalar qo‘ying, shunda manba alohida sanaladi:
`?src=banner`, `?src=qr`, `?src=telegram`, `?src=instagram`, `?src=facebook`, `?src=flyer`.
Tayyor havolalar statistika sahifasining pastida bor.

Statistika sahifasiga kirgan qurilmadagi tashriflar hisobga olinmaydi.
Hisoblagich bepul `abacus.jasoncameron.dev` servisida ishlaydi.

## Ariza formasi

Arizalar FormSubmit orqali `sodikhovd@gmail.com` ga keladi. Birinchi arizadan keyin FormSubmit
shu pochtaga tasdiqlash xati yuboradi — undagi **Activate Form** tugmasini bosish kerak.
Tasdiqlanmaguncha arizalar yetib bormaydi, sayt esa mijozga Telegram orqali yozishni taklif qiladi.

## Real loyihalarni qo‘shish

`main.js` boshidagi `PROJECTS` ro‘yxatiga loyiha qo‘shing — «Tanlangan loyihalar» bo‘limi avtomatik chiqadi:

```js
const PROJECTS = [
  {
    name: 'Loyiha nomi',
    category: 'Internet do‘kon',
    challenge: 'Mijozning vazifasi',
    solution: 'Biz qurgan yechim',
    result: 'O‘lchanadigan natija yoki topshirilgan ish',
    features: ['Katalog', 'Payme to‘lov', 'Admin panel'],
    tech: ['Laravel', 'Vue.js', 'MySQL'],
    image: 'images/loyiha.webp',
  },
];
```

## O‘z domeningizni ulash

Domen (masalan `ayro.uz`) sotib olingach: repo **Settings → Pages → Custom domain** ga domenni yozing
va DNS’da `CNAME` yozuvini `diyorbek1118.github.io` ga yo‘naltiring. Keyin `index.html`, `sitemap.xml`
va `robots.txt` dagi manzillarni yangi domenga almashtiring.
