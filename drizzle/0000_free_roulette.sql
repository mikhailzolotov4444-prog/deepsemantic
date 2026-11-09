CREATE TABLE "app_meta" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"topic" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"handled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "document_leads" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"document_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"level" text NOT NULL,
	"topics" text[] DEFAULT '{}' NOT NULL,
	"type" text NOT NULL,
	"access" text NOT NULL,
	"status" text NOT NULL,
	"file_ref" text,
	"file_name" text,
	"file_mime" text,
	"file_size" integer,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"published_at" timestamp with time zone,
	"download_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "documents_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "document_leads" ADD CONSTRAINT "document_leads_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "documents_status_idx" ON "documents" USING btree ("status");