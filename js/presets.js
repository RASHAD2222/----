/**
 * Valorant Crosshair Presets Database
 * Categorized into Pro Players, Geometric Shapes, and Fun/Troll Designs.
 */

const PRESETS_DATA = [
  // ================= PRO PLAYERS =================
  {
    id: 'tenz',
    name: 'TenZ',
    category: 'pros',
    description: 'كروس هير TenZ الأيقوني بلون السيان وبدون خطوط خارجية',
    tags: ['Sentinels', 'Cyan', 'Compact'],
    code: '0;s;1;P;c;5;h;0;m;0;0t;1;0l;4;0v;4;0o;2;0a;1;0f;0;1b;0'
  },
  {
    id: 'aspas',
    name: 'Aspas',
    category: 'pros',
    description: 'نقطة Aspas الكبيرة بلون السيان مع تحديد خارجي دقيق',
    tags: ['Leviatán', 'Dot', 'Cyan'],
    code: '0;P;c;5;o;1;d;1;z;4;0b;0;1b;0'
  },
  {
    id: 'boaster',
    name: 'Boaster',
    category: 'pros',
    description: 'نقطة Boaster الخضراء الكلاسيكية مع إطار أسود',
    tags: ['FNATIC', 'Dot', 'Green'],
    code: '0;s;1;P;c;1;o;1;d;1;0b;0;1b;0'
  },
  {
    id: 'scream',
    name: 'ScreaM',
    category: 'pros',
    description: 'نقطة الـ One-Tap الدقيقة جداً بحجم 1',
    tags: ['Headshot Machine', 'Tiny Dot', 'Cyan'],
    code: '0;s;1;P;c;5;o;1;d;1;z;1;0b;0;1b;0'
  },
  {
    id: 'yay',
    name: 'Yay',
    category: 'pros',
    description: 'كروس هير El Diablo الأبيض الملاصق بدون تباعد',
    tags: ['El Diablo', 'White', 'Classic'],
    code: '0;P;h;0;f;0;0l;4;0o;0;0a;1;0f;0;1b;0'
  },
  {
    id: 'demon1',
    name: 'Demon1',
    category: 'pros',
    description: 'نقطة بطل العالم Demon1 البيضاء النقية والمحددة',
    tags: ['Champions', 'White', 'Dot'],
    code: '0;s;1;P;o;1;d;1;m;0;0b;0;1b;0'
  },
  {
    id: 'jinggg',
    name: 'Jinggg',
    category: 'pros',
    description: 'كروس هير دويلست Paper Rex بلون السيان المميز',
    tags: ['Paper Rex', 'Duelist', 'Cyan'],
    code: '0;s;1;P;c;5;h;0;0t;2;0l;4;0o;2;0a;1;0f;0;1b;0'
  },
  {
    id: 'derke',
    name: 'Derke',
    category: 'pros',
    description: 'صليب Derke الصغير الأبيض مع نقطة مركزية',
    tags: ['FNATIC', 'White', 'Hybrid'],
    code: '0;s;1;P;o;1;d;1;f;0;s;0;0t;1;0l;1;0o;2;0a;1;0f;0;1b;0'
  },
  {
    id: 'f0rsaken',
    name: 'f0rsakeN',
    category: 'pros',
    description: 'الكروس هير الميكرو الدقيق 1-1-1-1',
    tags: ['Paper Rex', 'Micro', 'White'],
    code: '0;s;1;P;o;1;0t;1;0l;1;0o;1;0a;1;0f;0;1b;0'
  },
  {
    id: 'chronicle',
    name: 'Chronicle',
    category: 'pros',
    description: 'كروس هير أحمر أنيق وعالي التباين',
    tags: ['FNATIC', 'Red', 'Pro'],
    code: '0;P;c;7;o;1;f;0;0t;1;0l;3;0v;3;0o;2;0a;1;0f;0;1b;0'
  },
  {
    id: 'cryocells',
    name: 'Cryocells',
    category: 'pros',
    description: 'كروس هير 100 Thieves الأخضر الرفيع',
    tags: ['100T', 'Green', 'Sniper'],
    code: '0;s;1;P;c;1;h;0;0l;4;0o;2;0a;1;0f;0;1b;0'
  },
  {
    id: 'nats',
    name: 'nAts',
    category: 'pros',
    description: 'كروس هير الأخضر الصغير الأسطوري لصانع اللعب nAts',
    tags: ['Lurker', 'Green', 'Accurate'],
    code: '0;P;c;1;o;1;0t;1;0l;2;0o;1;0a;1;0f;0;1b;0'
  },
  {
    id: 'tarik',
    name: 'Tarik',
    category: 'pros',
    description: 'نقطة ستريمر الجماهير Tarik البيضاء الواضحة',
    tags: ['Major Winner', 'Dot', 'Streamer'],
    code: '0;P;o;1;d;1;0b;0;1b;0'
  },
  {
    id: 'zekken',
    name: 'Zekken',
    category: 'pros',
    description: 'نقطة خضراء مع إطار عريض لثبات فائق على الرأس',
    tags: ['Sentinels', 'Green', 'Dot'],
    code: '0;P;c;1;t;2;o;1;d;1;z;1;a;1;0b;0;1b;0'
  },

  // ================= GEOMETRIC SHAPES =================
  {
    id: 'small_dot',
    name: 'نقطة الهيد شوت الدقيقة',
    category: 'shapes',
    description: 'نقطة مركزية خضراء مثالية للتصويب النظيف على مسافات بعيدة',
    tags: ['Headshot', 'Dot', 'Green'],
    code: '0;P;c;1;o;1;d;1;z;2;a;1;0b;0;1b;0'
  },
  {
    id: 'hollow_box',
    name: 'مربع مفرغ (Hollow Box)',
    category: 'shapes',
    description: 'مربع مميز بإطار يحيط برأس الخصم بالكامل',
    tags: ['Box', 'Square', 'Popular'],
    code: '0;P;c;1;h;0;0t;4;0l;1;0o;2;0a;1;0f;0;1b;0'
  },
  {
    id: 'classic_cs',
    name: 'الصليب الكلاسيكي (CS:GO)',
    category: 'shapes',
    description: 'شكل الصليب التقليدي المحبوب في ألعاب الشوتر التكتيكية',
    tags: ['Classic', 'CSGO', 'Standard'],
    code: '0;P;c;1;h;0;0t;1;0l;5;0o;3;0a;1;0f;0;1b;0'
  },
  {
    id: 'circle',
    name: 'الدائرة المركزة (Circle)',
    category: 'shapes',
    description: 'تصميم دائري متناسق يركز العين على الهدف فوراً',
    tags: ['Circle', 'Clean', 'Cyan'],
    code: '0;P;c;5;h;0;d;1;z;4;0t;4;0l;1;0o;2;0a;1;0f;0;1b;0'
  },
  {
    id: 'diamond',
    name: 'الماسة (Diamond)',
    category: 'shapes',
    description: 'شكل ماسي هندسي مائل وجذاب',
    tags: ['Diamond', 'Geometric', 'Cyan'],
    code: '0;P;c;5;h;0;d;1;z;1;0t;3;0l;2;0o;1;0a;1;0f;0;1b;0'
  },
  {
    id: 'plus_sign',
    name: 'علامة الزائد السميكة (+)',
    category: 'shapes',
    description: 'صليب بارز وواضح جداً في جميع الإضاءات والخرائط',
    tags: ['Plus', 'High-Vis', 'Yellow'],
    code: '0;P;c;4;h;0;0t;3;0l;3;0o;0;0a;1;0f;0;1b;0'
  },
  {
    id: 'shuriken',
    name: 'شوريكين النينجا (Shuriken)',
    category: 'shapes',
    description: 'شكل نجمة النينجا مع خطوط مدمجة وزوايا حادة',
    tags: ['Ninja', 'Shuriken', 'Red'],
    code: '0;P;c;7;t;2;o;1;d;1;z;1;a;0;0t;1;0l;3;0v;3;0o;1;0a;1;0f;0;1t;2;1l;2;1v;2;1o;3;1a;1;1f;0'
  },
  {
    id: 'grid_cross',
    name: 'الشبكة المزدوجة (Hashtag)',
    category: 'shapes',
    description: 'صليب ثنائي بخطوط داخلية وخارجية متداخلة',
    tags: ['Grid', 'Hashtag', 'Double'],
    code: '0;P;c;5;h;0;0t;1;0l;6;0o;3;0a;1;0f;0;1t;1;1l;4;1o;6;1a;0.8;1f;0'
  },

  // ================= FUN & TROLL =================
  {
    id: 'heart',
    name: 'القلب (Heart)',
    category: 'fun',
    description: 'كروس هير شهير على شكل قلب أحمر لعشاق اللقطات المرحة',
    tags: ['Heart', 'Red', 'Cute'],
    code: '0;P;c;7;o;0.1;d;1;z;1;a;0;m;1;0t;10;0l;5;0v;0;0g;1;0o;1;0a;1;0f;0;1t;0;1l;1;1v;1;1g;1;1o;0;1a;1;1m;0;1f;0'
  },
  {
    id: 'flower',
    name: 'الزهرة الوردية (Flower)',
    category: 'fun',
    description: 'زهرة وردية لطيفة ومحكمة في نفس الوقت للتصويب',
    tags: ['Flower', 'Pink', 'Floral'],
    code: '0;P;c;6;o;1;d;1;z;3;a;0;0t;3;0l;2;0o;2;0a;1;0f;0;1t;2;1l;4;1o;5;1a;1;1m;0;1f;0'
  },
  {
    id: 'nerd_glasses',
    name: 'نظارة الطالب (Nerd Glasses)',
    category: 'fun',
    description: 'تصميم نظارة سوداء مميزة وممتعة للعب الكاجوال والضحك',
    tags: ['Glasses', 'Nerd', 'Fun'],
    code: '0;s;1;P;c;8;u;000000FF;t;2;o;1;d;1;z;1;a;0;0t;3;0l;2;0o;5;0a;1;0f;0;1t;2;1l;4;1o;0;1a;1;1m;0;1f;0'
  },
  {
    id: 'smiley',
    name: 'الابتسامة الصفراء (Smiley Face)',
    category: 'fun',
    description: 'وجه أصفر مبتسم يوزع ون-تابات بابتسامة عريضة',
    tags: ['Smiley', 'Yellow', 'Troll'],
    code: '0;P;c;4;t;2;o;1;d;1;z;2;a;1;0t;2;0l;3;0v;1;0g;1;0o;4;0a;1;0f;0;1t;2;1l;3;1o;2;1a;1;1f;0'
  },
  {
    id: 'pokeball',
    name: 'كرة البوكيمون (Pokeball)',
    category: 'fun',
    description: 'كرة بوكيمون حمراء محددة لصيد الخصوم',
    tags: ['Pokemon', 'Pokeball', 'Gaming'],
    code: '0;P;c;7;o;1;d;1;z;2;a;1;0t;3;0l;2;0o;3;0a;1;0f;0;1t;3;1l;2;1o;6;1a;0.7;1f;0'
  },
  {
    id: 'among_us',
    name: 'أمونغ آس (Among Us)',
    category: 'fun',
    description: 'شخصية أمونغ آس الكلاسيكية - Sus Crosshair!',
    tags: ['Among Us', 'Meme', 'Cyan'],
    code: '0;P;c;5;t;3;o;1;f;0;m;1;0t;4;0l;1;0v;5;0g;1;0o;0;0a;1;0f;0;1t;8;1l;3;1v;1;1g;1;1o;4;1a;1;1m;0;1f;0'
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PRESETS_DATA };
}
