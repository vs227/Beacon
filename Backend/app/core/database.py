from supabase import Client, create_client
from app.core.config import settings


class Database:
    _client: Client | None = None

    @classmethod
    def get_client(cls) -> Client:
        if cls._client is None:
            key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
            cls._client = create_client(
                settings.SUPABASE_URL,
                key
            )
        return cls._client


supabase: Client = Database.get_client()