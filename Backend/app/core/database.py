import httpx
from supabase import Client, ClientOptions, create_client
from app.core.config import settings


class Database:
    _client: Client | None = None

    @classmethod
    def get_client(cls) -> Client:
        if cls._client is None:
            key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
            # Force HTTP/1.1 to fix WinError 10035 (HTTP/2 non-blocking socket
            # issue on Windows with httpcore)
            http_client = httpx.Client(http2=False)
            cls._client = create_client(
                settings.SUPABASE_URL,
                key,
                options=ClientOptions(httpx_client=http_client),
            )
        return cls._client


supabase: Client = Database.get_client()