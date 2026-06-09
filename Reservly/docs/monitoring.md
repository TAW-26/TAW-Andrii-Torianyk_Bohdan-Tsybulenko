# Monitoring Aplikacji i Logowanie Błędów

Dokumentacja konfiguracji systemu monitorowania wydajności (**Prometheus** + **Grafana**) oraz dedykowanego mechanizmu logowania błędów po stronie serwera dla projektu **Reservly**.

---

## 1. Logowanie Błędów po Stronie Serwera

W ramach zadania implementacji bezpieczeństwa i stabilności aplikacji, w pliku `server.js` wdrożono dedykowany middleware do przechwytywania awarii. Każdy błąd generowany przez aplikację є automatycznie rejestrowany i dopisywany do pliku `errors.log` w głównym katalogu backendu.

### Awaria rejestruje pełny kontekst operacji:
**Czas wystąpienia:** Dokładna data i godzina rejestracji błędu w formacie ISO (`new Date().toISOString()`).
**Typ błędu:** Nazwa klasy błędu (np. `ValidationError`, `MongoNetworkError`, `Error`).
**Kontekst żądania:** Metoda HTTP (`req.method`), pełny adres URL (`req.originalUrl`) oraz adres IP klienta (`req.ip`).
**Stack Trace:** Pełny zrzut stosu wywołań (`err.stack`), co pozwala na szybką lokalizację problematycznej linii kodu.

> **Przykład struktury logu w `errors.log`:**
> ```text
> [2026-06-09T17:05:12.123Z] [DatabaseError] MongoNetworkError: connection timed out
> Context: Method: GET | URL: /api/fields | IP: ::1
> Stack: Error: MongoNetworkError: connection timed out at ...
> --------------------------------------------------
> ```

---

## 2. Monitorowanie Czasu Odpowiedzi (Prometheus & Grafana)

Do śledzenia wydajności backendu w czasie rzeczywistym wykorzystano integrację systemów **Prometheus** i **Grafana** wraz z pakietami `express-prom-bundle` oraz `prom-client`.

* **Czas odpowiedzi (Response Time):** Jest mierzony i kategoryzowany automatycznie przez histogram `http_request_duration_seconds` na podstawie metod HTTP, ścieżek URL (path) oraz kodów statusu odpowiedzi (200, 400, 500 itd.).
* **Metryki systemowe Node.js:** Włączono priorytetowe monitorowanie zużycia procesora (`process_cpu_seconds_total`), pamięci RAM (`process_resident_memory_bytes`), lagów pętli zdarzeń (`nodejs_eventloop_lag_seconds`) oraz alokacji sterty (Heap).

ℹ*Wszystkie dane są agregowane przez serwer Prometheus pod adresem skanowania:* `http://localhost:5000/metrics`.

---

## 3. Testy Stabilności pod Obciążeniem (Stress Tests)

W celu weryfikacji odporności serwera na wysoki ruch, przeprowadzono testy stabilności za pomocą profesjonalnego narzędzia **Autocannon**.

### Parametry przeprowadzonego testu:
* **Czas trwania:** 10 sekund
* **Liczba jednoczesnych połączeń (Connections):** 50 virtuelnych użytkowników
* **Testowany punkt końcowy:** `http://localhost:5000/api/fields`

### Wyniki testu wydajnościowego:

| Statystyka | Wartość | Opis operacyjny |
| :--- | :--- | :--- |
| **Średnia prędkość (Req/Sec)** | **99.3** | Serwer stabilnie obsługiwał prawie 100 żądań w każdej sekundzie. |
| **Średnie opóźnienie (Avg Latency)** | **466.94 ms** | Średni czas odpowiedzi serwera na jedno zapytanie pod pełnym obciążeniem. |
| **97.5% Żądań (Percentile)** | **869 ms** | Ponad 97.5% użytkowników otrzymało odpowiedź в czasie poniżej 0.9 sekundy. |
| **Maksymalne opóźnienie (Max)** | **1910 ms** | Najwyższy czas odpowiedzi odnotowany w szczytowym momencie obciążenia sterty. |
| **Przepustowość danych** | **117 kB/s** | Średnia prędkość transferu danych tekstowych generowanych przez API. |

### Wnioski końcowe
Podczas trwania testu aplikacja zachowała **100% stabilności**, nie odnotowano żadnych awarii (Crash), а dashboard w Grafanie poprawnie zwizualizował skoki obciążenia CPU oraz zajętości pamięci RAM, które płynnie wróciły do normy natychmiast po zakończeniu testu.