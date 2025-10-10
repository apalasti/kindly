CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE "public"."users" (
    "id" BIGSERIAL,
    "name" varchar NOT NULL,
    "email" varchar NOT NULL,
    "password" varchar NOT NULL,
    "date_of_birth" date NOT NULL,
    "about_me" varchar NOT NULL,
    "is_volunteer" boolean NOT NULL DEFAULT FALSE,
    "avg_rating" decimal(2, 1) NOT NULL,
    "updated_at" timestamp NOT NULL,
    "created_at" timestamp NOT NULL,
    CONSTRAINT "pk_users_id" PRIMARY KEY ("id")
);

CREATE TABLE "public"."requests" (
    "id" BIGSERIAL,
    "name" varchar NOT NULL,
    "description" varchar NOT NULL,
    "longitude" decimal NOT NULL,
    "latitude" decimal NOT NULL,
    "start" timestamp NOT NULL,
    "end" timestamp NOT NULL,
    "reward" integer NOT NULL,
    "creator_id" bigint NOT NULL,
    "is_completed" boolean NOT NULL,
    "updated_at" timestamp NOT NULL,
    "created_at" timestamp NOT NULL,
    CONSTRAINT "pk_table_2_id" PRIMARY KEY ("id")
);

CREATE TABLE "public"."request_types" (
    "id" bigint NOT NULL,
    "name" varchar,
    CONSTRAINT "pk_table_3_id" PRIMARY KEY ("id")
);

CREATE TABLE "public"."type_of" (
    "request_id" bigint NOT NULL UNIQUE,
    "request_type_id" bigint NOT NULL
);

CREATE TABLE "public"."applications" (
    "request_id" bigint NOT NULL UNIQUE,
    "user_id" bigint NOT NULL,
    "is_accepted" boolean NOT NULL,
    "volunteer_rating" integer,
    "help_seeker_rating" integer
);

-- Foreign key constraints
-- Schema: public
ALTER TABLE "public"."requests" ADD CONSTRAINT "fk_requests_creator_id_users_id" FOREIGN KEY("creator_id") REFERENCES "public"."users"("id");
ALTER TABLE "public"."type_of" ADD CONSTRAINT "fk_type_of_request_type_id_request_types_id" FOREIGN KEY("request_type_id") REFERENCES "public"."request_types"("id");
ALTER TABLE "public"."type_of" ADD CONSTRAINT "fk_type_of_request_id_requests_id" FOREIGN KEY("request_id") REFERENCES "public"."requests"("id");
ALTER TABLE "public"."requests" ADD CONSTRAINT "fk_requests_id_applications_request_id" FOREIGN KEY("id") REFERENCES "public"."applications"("request_id");
ALTER TABLE "public"."users" ADD CONSTRAINT "fk_users_id_applications_user_id" FOREIGN KEY("id") REFERENCES "public"."applications"("user_id");
