FROM ghcr.io/astral-sh/uv:python3.10-alpine

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install Python dependencies
COPY uv.lock pyproject.toml .
RUN uv sync --all-extras

# Copy project
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD sh -c '\
  if [ "$DEV" = "1" ]; then \
    uv run python -m scripts.insert_data; \
  fi && \
  uv run fastapi dev app/main.py --host 0.0.0.0 --port 8000 \
'
