DROP TABLE IF EXISTS "users";

CREATE TABLE IF NOT EXISTS "user" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "name" varchar(255) NOT NULL,
  "age" integer NOT NULL,
  "email" varchar(255) NOT NULL UNIQUE
);
