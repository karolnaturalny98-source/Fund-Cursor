# Naprawa cache dla danych firm

## Problem
Po dodaniu danych w panelu admina (teamMembers, timelineItems, certifications, mediaItems) nie były widoczne na stronie profilu firmy `/firmy/[slug]` z powodu nieczyszczonego cache.

## Rozwiązanie
Dodano `revalidateTag("companies")` do wszystkich endpointów API które modyfikują dane firmy:

### Naprawione endpointy:

1. **`/api/admin/companies/[slug]/team` (POST)**
   - Dodano `revalidateTag("companies")` po utworzeniu członka zespołu

2. **`/api/admin/companies/[slug]/team/[memberId]` (PATCH, DELETE)**
   - Dodano `revalidateTag("companies")` po aktualizacji/usunięciu członka zespołu

3. **`/api/admin/companies/[slug]` (PATCH, DELETE)**
   - Dodano `revalidateTag("companies")` do istniejących `revalidatePath` po aktualizacji/usunięciu firmy

### Endpointy które już miały `revalidateTag("companies")`:
- ✅ `/api/admin/companies/[slug]/timeline` (POST)
- ✅ `/api/admin/companies/[slug]/timeline/[itemId]` (PATCH, DELETE)
- ✅ `/api/admin/companies/[slug]/certifications` (POST)
- ✅ `/api/admin/companies/[slug]/certifications/[certId]` (PATCH, DELETE)
- ✅ `/api/admin/companies/[slug]/media` (POST)
- ✅ `/api/admin/companies/[slug]/media/[mediaId]` (PATCH, DELETE)
- ✅ `/api/admin/companies/[slug]/trading-profile` (PUT)

## Jak to działa

1. Cache jest przechowywany w `unstable_cache` z tagiem `["companies"]` (5 minut revalidate)
2. Po modyfikacji danych przez admina, `revalidateTag("companies")` czyści cache
3. Następne żądanie do `/firmy/[slug]` pobiera świeże dane z bazy

## Status
✅ Wszystkie endpointy modyfikujące dane firmy teraz czyszczą cache
✅ Dane dodane w panelu admina będą widoczne natychmiast na stronie profilu firmy

