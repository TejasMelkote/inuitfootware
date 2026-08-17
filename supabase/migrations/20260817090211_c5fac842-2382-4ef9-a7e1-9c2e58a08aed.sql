CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  description text NOT NULL,
  short_description text NOT NULL,
  price integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  images text[] NOT NULL DEFAULT '{}',
  colors text[] NOT NULL DEFAULT '{}',
  sizes text[] NOT NULL DEFAULT '{}',
  materials text[] NOT NULL DEFAULT '{}',
  styles text[] NOT NULL DEFAULT '{}',
  occasions text[] NOT NULL DEFAULT '{}',
  badge text,
  featured boolean NOT NULL DEFAULT false,
  inventory integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  thumbnail_url text NOT NULL,
  video_url text NOT NULL,
  duration text NOT NULL,
  display_order integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.videos TO anon, authenticated;
GRANT ALL ON public.videos TO service_role;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Videos are publicly readable" ON public.videos FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  state text NOT NULL DEFAULT 'WELCOME',
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  selected_product_id uuid REFERENCES public.products(id),
  selected_size text,
  selected_color text,
  delivery_draft jsonb NOT NULL DEFAULT '{}'::jsonb,
  viewed_videos text[] NOT NULL DEFAULT '{}',
  message_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('user','bot')),
  message text NOT NULL DEFAULT '',
  message_type text NOT NULL DEFAULT 'text',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_conversation_idx ON public.messages (conversation_id, created_at);
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  customer jsonb NOT NULL,
  items jsonb NOT NULL,
  subtotal integer NOT NULL,
  delivery_address jsonb NOT NULL,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','processing','dispatched','delivered','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX analytics_event_idx ON public.analytics_events (event, created_at);
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER products_touch BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER conversations_touch BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER orders_touch BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.products (name, slug, category, description, short_description, price, images, colors, sizes, materials, styles, occasions, badge, featured, inventory) VALUES
('Milano Loafer','milano','loafer','A soft, unlined loafer built on our Milano last. Hand-finished full-grain leather softens with wear and takes the shape of your foot — equally at home at dinner or in the boardroom.','Hand-finished full-grain leather',18900,ARRAY['/products/milano.jpg'],ARRAY['Black','Tan','Dark Brown'],ARRAY['UK 6','UK 7','UK 8','UK 9','UK 10','UK 11'],ARRAY['Full-grain leather','Leather sole'],ARRAY['classic','minimal'],ARRAY['formal','business','dinner'],'Atelier Made',true,14),
('Atelier Sneaker','atelier-sneaker','sneaker','Our quietest silhouette. Full-grain leather panels, a suede toe and a hand-trimmed cupsole — designed to be worn every day and still look considered.','Minimal leather and suede construction',15500,ARRAY['/products/atelier-sneaker.jpg'],ARRAY['White','Tan'],ARRAY['UK 6','UK 7','UK 8','UK 9','UK 10','UK 11'],ARRAY['Calf leather','Suede'],ARRAY['minimal','relaxed'],ARRAY['casual','travel','weekend'],'New Season',true,20),
('Heritage Boot','heritage-boot','boot','A six-eyelet boot with a storm welt and a structured shaft that holds its shape for years. Made in a limited run of 200 pairs each season.','Full-grain leather with a structured silhouette',22900,ARRAY['/products/heritage-boot.jpg'],ARRAY['Tan','Dark Brown'],ARRAY['UK 7','UK 8','UK 9','UK 10','UK 11'],ARRAY['Full-grain leather','Storm welt'],ARRAY['statement','relaxed'],ARRAY['casual','winter','travel'],'Limited Run',true,8),
('Verona Oxford','verona-oxford','dress','The Verona is our formal cornerstone — a closed-lacing cap-toe oxford in polished box calf, hand-lasted for a clean, elongated line under tailoring.','Refined cap-toe formal silhouette',19800,ARRAY['/products/verona-oxford.jpg'],ARRAY['Black','Dark Brown'],ARRAY['UK 6','UK 7','UK 8','UK 9','UK 10','UK 11'],ARRAY['Box calf leather','Leather sole'],ARRAY['classic','minimal'],ARRAY['formal','wedding','business'],'Formal Icon',true,12),
('Monaco Slip-On','monaco-slip-on','loafer','Unlined nappa leather with a low, understated profile. The pair our clients reach for on flights, in summer, and everywhere formality is optional.','Soft leather with an understated profile',16900,ARRAY['/products/monaco-slip-on.jpg'],ARRAY['Tan','Black','Dark Brown'],ARRAY['UK 6','UK 7','UK 8','UK 9','UK 10'],ARRAY['Nappa leather'],ARRAY['relaxed','minimal'],ARRAY['casual','travel','summer'],'Everyday',false,18),
('Aspen Chelsea','aspen-chelsea','boot','Classic Chelsea construction, cut slightly sharper through the waist. A leather-stacked heel and hand-burnished finish give it depth that reads beautifully in winter light.','Classic Chelsea construction with a modern edge',21500,ARRAY['/products/aspen-chelsea.jpg'],ARRAY['Dark Brown','Black'],ARRAY['UK 6','UK 7','UK 8','UK 9','UK 10','UK 11'],ARRAY['Calf leather','Elastic gore'],ARRAY['classic','statement'],ARRAY['dinner','winter','business'],'Signature',true,10),
('Roma Derby','roma-derby','dress','An open-laced derby with a rounder last and a softer shoulder — the more forgiving cousin of the Verona, made for long days in tailoring.','Softly structured open-laced derby',18500,ARRAY['/products/roma-derby.jpg'],ARRAY['Black','Dark Brown'],ARRAY['UK 6','UK 7','UK 8','UK 9','UK 10','UK 11'],ARRAY['Box calf leather'],ARRAY['classic','relaxed'],ARRAY['business','formal','wedding'],'Atelier Made',false,15),
('Luna Court Sneaker','luna-court','sneaker','A low court profile in soft white calf with a tonal heel tab. Cleaned up enough for dinner, quiet enough for everything else.','Low court profile in soft white calf',16200,ARRAY['/products/luna-court.jpg'],ARRAY['White','Tan'],ARRAY['UK 6','UK 7','UK 8','UK 9','UK 10'],ARRAY['Calf leather','Rubber cupsole'],ARRAY['minimal','statement'],ARRAY['casual','dinner','weekend'],'New Season',false,22);

INSERT INTO public.videos (title, description, thumbnail_url, video_url, duration, display_order, active) VALUES
('Selecting the Leather','Every Inuit pair begins with carefully selected hides chosen for grain, durability and feel.','/atelier/leather.jpg','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4','0:48',1,true),
('Hand Assembly','Skilled artisans shape, stitch and construct each pair with precision.','/atelier/assembly.jpg','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4','1:02',2,true),
('The Final Finish','Every pair is inspected, polished and finished before it leaves the atelier.','/atelier/finish.jpg','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4','0:54',3,true);