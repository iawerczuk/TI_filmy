# Ranking filmów

Aplikacja realizująca ranking filmów na podstawie głosów użytkowników.
Backend: Node.js (Express) + SQLite. Interfejs w katalogu `public/`.

## Uruchomienie
1. `npm install`
2. `node server.js`

Działa pod adresem:
`http://localhost:5050`

## Zakres funkcjonalny
* **Filmy**: dodawanie nowych tytułów oraz listowanie bazy filmów.
* **Oceny**: wystawianie ocen w skali 1–5 dla wybranych filmów.
* **Ranking**: automatyczne wyliczanie średniej ocen (zaokrąglonej do 2 miejsc po przecinku) oraz liczby głosów.
* **Sortowanie**: automatyczne pozycjonowanie filmów od najwyżej ocenianych (malejąco).

## API (skrót)
* `POST /api/movies` – dodanie filmu `{title, year}`
* `GET /api/movies` – lista filmów wraz z `avg_score` i `votes`
* `POST /api/ratings` – dodanie oceny `{movie_id, score}`

## Walidacja i statusy HTTP
* **201 Created** – poprawne dodanie filmu lub oceny.
* **200 OK** – poprawne pobranie listy rankingowej.
* **400 Bad Request** – błędne dane (np. ocena poza zakresem 1–5 lub brak tytułu).
* **404 Not Found** – próba oceny nieistniejącego filmu.
* **500 Internal Server Error** – błąd bazy danych lub serwera.

## Bezpieczeństwo i HTTP
* **Nagłówki**: zaimplementowane `X-Content-Type-Options: nosniff` oraz `Referrer-Policy`.
* **Polityka CSP**: dostosowana pod skrypty i style inline (Helmet.js).
* **Cache**: `Cache-Control: no-store` dla endpointów API.
* **X-Powered-By**: nagłówek wyłączony.

## Testowanie
Plik `tests.rest` zawiera przykładowe wywołania endpointów API.
Testy wykonano przy użyciu VS Code – rozszerzenie **REST Client**.
