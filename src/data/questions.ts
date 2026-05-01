export type Question = {
  id: string;
  text: string;
  answer: boolean;
  category: 'gri-su' | 'guvenlik' | 'tasarruf' | 'yeniden-kullanim' | 'yanlis-bilinen';
  explanation: string;
};

export const QUESTIONS: Question[] = [
  { id: 'q001', category: 'gri-su', text: 'Duşta kullanılan su, uygun filtreleme ile gri su olarak değerlendirilebilir mi?', answer: true, explanation: 'Evet. Duş suyu gri su kaynaklarından biridir; bahçe sulama gibi alanlarda arıtılarak kullanılabilir.' },
  { id: 'q002', category: 'guvenlik', text: 'Tuvaletten gelen atık su gri su sayılır mı?', answer: false, explanation: 'Hayır. Tuvalet suyu siyah sudur; hastalık riski taşır ve gri su sayılmaz.' },
  { id: 'q003', category: 'guvenlik', text: 'Çamaşır suyu karışmış suyu bitki sulamada kullanmak güvenli midir?', answer: false, explanation: 'Hayır. Çamaşır suyu toprağa ve bitkilere zarar verebilir.' },
  { id: 'q004', category: 'gri-su', text: 'El yıkama lavabosundan gelen su bazı durumlarda gri su olabilir mi?', answer: true, explanation: 'Evet. Ağır kimyasal içermiyorsa lavabo suyu gri su kaynağı olabilir.' },
  { id: 'q005', category: 'tasarruf', text: 'Diş fırçalarken musluğu kapatmak su tasarrufu sağlar mı?', answer: true, explanation: 'Evet. Küçük alışkanlıklar toplamda ciddi su tasarrufu sağlar.' },
  { id: 'q006', category: 'guvenlik', text: 'Yağlı bulaşık suyu doğrudan bahçeye dökülebilir mi?', answer: false, explanation: 'Hayır. Yağ toprak yapısını bozabilir ve canlılara zarar verebilir.' },
  { id: 'q007', category: 'yeniden-kullanim', text: 'Sebze yıkama suyu çiçek sulamada kullanılabilir mi?', answer: true, explanation: 'Evet. Deterjan yoksa sebze/meyve yıkama suyu bitkiler için tekrar kullanılabilir.' },
  { id: 'q008', category: 'yanlis-bilinen', text: 'Gri su içme suyu olarak kullanılabilir.', answer: false, explanation: 'Hayır. Gri su içme suyu değildir; arıtılsa bile kullanım amacı dikkatle belirlenmelidir.' },
  { id: 'q009', category: 'tasarruf', text: 'Kısa duş almak su tüketimini azaltır mı?', answer: true, explanation: 'Evet. Duş süresini azaltmak en etkili tasarruf yöntemlerinden biridir.' },
  { id: 'q010', category: 'guvenlik', text: 'İlaçlı veya kimyasal temizlik suyu gri su sistemine verilmelidir.', answer: false, explanation: 'Hayır. Kimyasal içerik gri suyun güvenli kullanımını bozar.' },
  { id: 'q011', category: 'gri-su', text: 'Banyo lavabosu suyu, tuvalet suyundan daha düşük risklidir.', answer: true, explanation: 'Evet. Bu yüzden banyo lavabosu suyu gri su, tuvalet suyu siyah su kabul edilir.' },
  { id: 'q012', category: 'yeniden-kullanim', text: 'Gri su rezervuar doldurmada kullanılabilir mi?', answer: true, explanation: 'Evet. Uygun tesisat ve arıtma ile klozet rezervuarlarında kullanılabilir.' },
  { id: 'q013', category: 'guvenlik', text: 'Gri su uzun süre bekletilirse güvenli kalır.', answer: false, explanation: 'Hayır. Bekleyen gri suda koku ve bakteri artışı olabilir; kısa sürede kullanılmalıdır.' },
  { id: 'q014', category: 'tasarruf', text: 'Musluklara perlatör takmak su tüketimini azaltabilir mi?', answer: true, explanation: 'Evet. Perlatör suyu hava ile karıştırarak daha az suyla benzer akış sağlar.' },
  { id: 'q015', category: 'yanlis-bilinen', text: 'Su tasarrufu sadece kurak bölgelerde önemlidir.', answer: false, explanation: 'Hayır. Su kaynakları her yerde sınırlıdır; tasarruf herkes için önemlidir.' },
  { id: 'q016', category: 'yeniden-kullanim', text: 'Klima yoğuşma suyu bazı temizlik işlerinde kullanılabilir mi?', answer: true, explanation: 'Evet. İçme suyu değildir ama bazı temizlik ve sulama amaçlarında değerlendirilebilir.' },
  { id: 'q017', category: 'guvenlik', text: 'Bebek bezi veya dışkı bulaşmış su gri su sayılır.', answer: false, explanation: 'Hayır. Dışkı bulaşı varsa siyah su riski vardır.' },
  { id: 'q018', category: 'gri-su', text: 'Gri suyun tekrar kullanımı içme suyu tüketimini azaltabilir mi?', answer: true, explanation: 'Evet. İçme kalitesindeki suyu her işte kullanmak yerine gri su bazı alanlarda yükü azaltır.' },
  { id: 'q019', category: 'tasarruf', text: 'Damlatan bir musluk zamanla çok su israf eder.', answer: true, explanation: 'Evet. Küçük damlalar günler içinde litrelerce su kaybına dönüşebilir.' },
  { id: 'q020', category: 'guvenlik', text: 'Gri suyu sebzelerin yenilen yapraklarına doğrudan püskürtmek uygundur.', answer: false, explanation: 'Hayır. Gri su yenilebilir kısımlara temas ettirilmemelidir.' },
  { id: 'q021', category: 'yeniden-kullanim', text: 'Yağmur suyu toplamak su tasarrufuna destek olur mu?', answer: true, explanation: 'Evet. Yağmur suyu gri su değildir ama yeniden kullanım için değerli bir kaynaktır.' },
  { id: 'q022', category: 'yanlis-bilinen', text: 'Gri su sistemi kurunca suyu sınırsız kullanabiliriz.', answer: false, explanation: 'Hayır. Gri su sistemi tasarrufu destekler ama israfı haklı çıkarmaz.' },
  { id: 'q023', category: 'gri-su', text: 'Çamaşır makinesi suyu deterjan türüne göre gri su olarak değerlendirilebilir.', answer: true, explanation: 'Evet. Fosfat/klor gibi zararlı içerikler yoksa bazı kullanımlar için değerlendirilebilir.' },
  { id: 'q024', category: 'guvenlik', text: 'Boya, tiner veya solvent karışmış su gri su sistemine uygundur.', answer: false, explanation: 'Hayır. Tehlikeli kimyasal içerir ve kesinlikle uygun değildir.' },
  { id: 'q025', category: 'tasarruf', text: 'Bahçeyi öğle sıcağında sulamak daha verimlidir.', answer: false, explanation: 'Hayır. Buharlaşma artar; sabah erken veya akşam sulama daha verimlidir.' },
  { id: 'q026', category: 'tasarruf', text: 'Bahçede damla sulama, hortumla rastgele sulamaya göre daha tasarruflu olabilir.', answer: true, explanation: 'Evet. Su doğrudan köke gider ve kayıp azalır.' },
  { id: 'q027', category: 'guvenlik', text: 'Gri su kullanırken çocukların doğrudan temasını azaltmak gerekir.', answer: true, explanation: 'Evet. Gri su içme suyu değildir; hijyen riski azaltılmalıdır.' },
  { id: 'q028', category: 'yanlis-bilinen', text: 'Berrak görünen her atık su güvenlidir.', answer: false, explanation: 'Hayır. Görünüş temiz olsa bile mikroorganizma veya kimyasal olabilir.' },
  { id: 'q029', category: 'gri-su', text: 'Mutfak lavabosu suyu genellikle yağ ve yemek artığı içerdiği için daha risklidir.', answer: true, explanation: 'Evet. Mutfak suyu gri su içinde daha dikkatli değerlendirilmelidir.' },
  { id: 'q030', category: 'yeniden-kullanim', text: 'Gri su arıtıldıktan sonra süs bitkilerinde kullanılabilir mi?', answer: true, explanation: 'Evet. Doğru arıtma ve uygulama ile süs bitkilerinde kullanılabilir.' },
  { id: 'q031', category: 'guvenlik', text: 'Gri suyu açık kapta günlerce biriktirmek iyi bir fikirdir.', answer: false, explanation: 'Hayır. Koku, sivrisinek ve bakteri riski artar.' },
  { id: 'q032', category: 'tasarruf', text: 'Tam dolmadan çamaşır makinesi çalıştırmak su ve enerji israfını artırabilir.', answer: true, explanation: 'Evet. Makineyi uygun dolulukta çalıştırmak daha verimlidir.' },
  { id: 'q033', category: 'tasarruf', text: 'Araba yıkarken hortumu sürekli açık bırakmak tasarruflu bir yöntemdir.', answer: false, explanation: 'Hayır. Kova veya basınç kontrollü sistem daha az su harcar.' },
  { id: 'q034', category: 'gri-su', text: 'Gri su yönetimi, su kıtlığına karşı yardımcı çözümlerden biridir.', answer: true, explanation: 'Evet. Tek çözüm değildir ama bilinçli kullanımda önemli katkı sağlar.' },
  { id: 'q035', category: 'yanlis-bilinen', text: 'Gri su kullanımı hiçbir planlama gerektirmez.', answer: false, explanation: 'Hayır. Filtreleme, kullanım alanı ve hijyen kuralları planlanmalıdır.' },
  { id: 'q036', category: 'guvenlik', text: 'Hastalık riski olan kişilerin kullandığı sularda daha dikkatli olunmalıdır.', answer: true, explanation: 'Evet. Gri su hijyen açısından dikkat ister.' },
  { id: 'q037', category: 'yeniden-kullanim', text: 'Akvaryum suyu bazı bitkiler için besinli sulama suyu olabilir mi?', answer: true, explanation: 'Evet. Kimyasal ilaç yoksa bazı bitkiler için faydalı olabilir.' },
  { id: 'q038', category: 'guvenlik', text: 'Tuzlu suyla yıkanmış çamaşır suyu her bitki için uygundur.', answer: false, explanation: 'Hayır. Tuz bitkilere ve toprağa zarar verebilir.' },
  { id: 'q039', category: 'tasarruf', text: 'Sızıntı yapan rezervuar fark edilmeden çok su harcayabilir.', answer: true, explanation: 'Evet. Rezervuar kaçakları büyük gizli su kayıplarındandır.' },
  { id: 'q040', category: 'gri-su', text: 'Gri su, doğru kullanılırsa çevre bilincini artıran bir uygulamadır.', answer: true, explanation: 'Evet. İnsanlara suyun tek kullanımlık olmadığını öğretir.' },
  { id: 'q041', category: 'guvenlik', text: 'Gri suyu içme suyu tesisatına bağlamak güvenlidir.', answer: false, explanation: 'Hayır. İçme suyu hattı ile gri su hattı kesinlikle karışmamalıdır.' },
  { id: 'q042', category: 'yeniden-kullanim', text: 'Duştan akan ilk soğuk su temiz bir kovada toplanıp kullanılabilir.', answer: true, explanation: 'Evet. Sıcak su gelene kadar akan temiz su bitki/temizlik için değerlendirilebilir.' },
  { id: 'q043', category: 'yanlis-bilinen', text: 'Su tasarrufu teknolojiden ibarettir; alışkanlıklar önemli değildir.', answer: false, explanation: 'Hayır. Teknoloji kadar günlük alışkanlıklar da belirleyicidir.' },
  { id: 'q044', category: 'tasarruf', text: 'Bulaşık makinesini tam doluyken çalıştırmak tasarruf sağlar.', answer: true, explanation: 'Evet. Tam dolulukta çalıştırmak su ve enerji verimini artırır.' },
  { id: 'q045', category: 'guvenlik', text: 'Gri su sistemlerinde basit filtreler saç, lif ve parçacıkları tutmaya yardım eder.', answer: true, explanation: 'Evet. İlk filtreleme tıkanma ve kirlilik riskini azaltır.' },
  { id: 'q046', category: 'guvenlik', text: 'Gri suyu çocuk oyun alanına püskürtmek uygundur.', answer: false, explanation: 'Hayır. Doğrudan temas riski olan alanlardan kaçınılmalıdır.' },
  { id: 'q047', category: 'gri-su', text: 'Gri su ile siyah su arasındaki temel fark tuvalet atığı içerip içermemesidir.', answer: true, explanation: 'Evet. Tuvalet atığı varsa siyah su olarak değerlendirilir.' },
  { id: 'q048', category: 'yeniden-kullanim', text: 'Gri su doğrudan kök bölgesine verilirse temas riski azalabilir.', answer: true, explanation: 'Evet. Yaprak ve yenilebilir kısımlardan uzak uygulama daha güvenlidir.' },
  { id: 'q049', category: 'guvenlik', text: 'Her deterjan bitkiler için güvenlidir.', answer: false, explanation: 'Hayır. Bazı deterjanlar tuz, bor veya zararlı kimyasallar içerebilir.' },
  { id: 'q050', category: 'tasarruf', text: 'Su ayak izi, tükettiğimiz ürünlerin üretiminde kullanılan suyu da anlatır.', answer: true, explanation: 'Evet. Su tüketimi sadece musluktan akan sudan ibaret değildir.' },
  { id: 'q051', category: 'yeniden-kullanim', text: 'Bu su kullanılabilir mi? Duşta sıcak su gelene kadar temiz kovada biriken soğuk su.', answer: true, explanation: 'Evet. Sabun veya kir karışmadan toplanan su temizlikte ya da bitkilerde değerlendirilebilir.' },
  { id: 'q052', category: 'guvenlik', text: 'Bu su kullanılabilir mi? Çamaşır suyu ile silinen yerlerden çıkan temizlik suyu.', answer: false, explanation: 'Hayır. Çamaşır suyu ve güçlü temizlik kimyasalları toprağa, bitkilere ve canlılara zarar verebilir.' },
  { id: 'q053', category: 'yeniden-kullanim', text: 'Bu su kullanılabilir mi? Deterjansız sebze yıkama suyunu süs bitkisine vermek.', answer: true, explanation: 'Evet. Deterjan yoksa sebze/meyve yıkama suyu içme dışı basit yeniden kullanım için uygundur.' },
  { id: 'q054', category: 'guvenlik', text: 'Bu su kullanılabilir mi? Kızartma yağı bulaşmış mutfak lavabosu suyu.', answer: false, explanation: 'Hayır. Yağlı mutfak suyu toprağı ve tesisatı bozabilir; güvenli gri su örneği değildir.' },
  { id: 'q055', category: 'yeniden-kullanim', text: 'Bu su kullanılabilir mi? Klima yoğuşma suyu ile balkon zemini silmek.', answer: true, explanation: 'Evet. İçme suyu değildir ama uygun temizlik işlerinde değerlendirilebilir.' },
  { id: 'q056', category: 'guvenlik', text: 'Bu su kullanılabilir mi? Bebek bezi yıkanan kovadaki su.', answer: false, explanation: 'Hayır. Dışkı veya idrar riski varsa siyah su riski oluşur; gri su olarak kullanılmaz.' },
  { id: 'q057', category: 'yeniden-kullanim', text: 'Bu su kullanılabilir mi? Akvaryumdan çıkan, ilaç eklenmemiş suyu süs bitkisine vermek.', answer: true, explanation: 'Evet. İlaç veya zararlı kimyasal yoksa bazı bitkiler için besinli sulama suyu olabilir.' },
  { id: 'q058', category: 'guvenlik', text: 'Bu su kullanılabilir mi? Saç boyası durulanan lavabodan gelen su.', answer: false, explanation: 'Hayır. Boya ve benzeri kimyasallar gri su sistemine verilmemelidir.' },
  { id: 'q059', category: 'gri-su', text: 'Bu su kullanılabilir mi? Sadece el sabunu kullanılan banyo lavabosu suyu, filtrelenerek.', answer: true, explanation: 'Evet. Ağır kimyasal yoksa banyo lavabosu suyu gri su kaynağı olabilir; yine de içme suyu değildir.' },
  { id: 'q060', category: 'guvenlik', text: 'Bu su kullanılabilir mi? Tuvalet temizliğinden çıkan suyu bahçeye dökmek.', answer: false, explanation: 'Hayır. Tuvalet kaynaklı su ve temizlik kimyasalları güvenli gri su sayılmaz.' },
  { id: 'q061', category: 'tasarruf', text: 'Bu su kullanılabilir mi? Bardakta kalan içme suyunu lavaboya dökmek yerine çiçeğe vermek.', answer: true, explanation: 'Evet. Temiz içme suyu artığı bitkilerde değerlendirilebilir; küçük davranışlar tasarruf alışkanlığı kazandırır.' },
  { id: 'q062', category: 'guvenlik', text: 'Bu su kullanılabilir mi? Çamaşır makinesinden çıkan çok parfümlü/yumuşatıcılı suyu sebzelere vermek.', answer: false, explanation: 'Hayır. Yumuşatıcı, parfüm, tuz veya bor içeren sular yenilebilir bitkiler için uygun değildir.' },
  { id: 'q063', category: 'yeniden-kullanim', text: 'Bu su kullanılabilir mi? Arabayı kovayla yıkarken kalan sabunsuz durulama suyunu zemine dökmeden temizlikte kullanmak.', answer: true, explanation: 'Evet. Yağ, deterjan veya kir yoğun değilse içme dışı temizlikte yeniden değerlendirilebilir.' },
  { id: 'q064', category: 'guvenlik', text: 'Bu su kullanılabilir mi? Tinerli boya fırçası yıkanan kapta kalan su.', answer: false, explanation: 'Hayır. Solvent ve boya atıkları tehlikeli kimyasaldır; gri su sistemi için kesinlikle uygun değildir.' },
  { id: 'q065', category: 'yeniden-kullanim', text: 'Bu su kullanılabilir mi? Yağmurdan temiz kovada biriken suyu bahçede kullanmak.', answer: true, explanation: 'Evet. Yağmur suyu gri su değildir ama içme dışı kullanım için değerli bir kaynaktır.' },
  { id: 'q066', category: 'guvenlik', text: 'Bu su kullanılabilir mi? Evcil hayvan dışkısı bulaşmış paspas suyu.', answer: false, explanation: 'Hayır. Dışkı bulaşı hastalık riski taşır; güvenli gri su kabul edilmez.' },
  { id: 'q067', category: 'yeniden-kullanim', text: 'Bu su kullanılabilir mi? Deterjansız meyve yıkama suyu ile balkon bitkilerini sulamak.', answer: true, explanation: 'Evet. Deterjan yoksa bu su basit yeniden kullanım için uygundur.' },
  { id: 'q068', category: 'guvenlik', text: 'Bu su kullanılabilir mi? Ağır yağ çözücüyle temizlenen mutfak yüzeyinden çıkan su.', answer: false, explanation: 'Hayır. Ağır yağ çözücüler ve güçlü kimyasallar gri su kullanımını güvensiz hale getirir.' },
  { id: 'q069', category: 'gri-su', text: 'Bu su kullanılabilir mi? Hafif sabunlu duş suyu, yenilebilir kısımlara temas etmeden kök bölgesine verilirse.', answer: true, explanation: 'Evet. Uygun filtreleme ve doğru uygulama ile süs/peyzaj bitkilerinde değerlendirilebilir; yenilebilir kısımlara temas etmemelidir.' },
  { id: 'q070', category: 'guvenlik', text: 'Bu su kullanılabilir mi? Berrak görünen ama içinde ilaç kalıntısı olabilecek su.', answer: false, explanation: 'Hayır. Berrak görünmek güvenli olduğu anlamına gelmez; ilaç kalıntısı varsa kullanılmamalıdır.' },
  { id: 'q071', category: 'tasarruf', text: 'Banyo yaparken kovada biriken temiz başlangıç suyunu tuvalet rezervuarında kullanmak tasarruf sağlar mı?', answer: true, explanation: 'Evet. İçme kalitesindeki suyu rezervuar için harcamayı azaltabilir.' },
  { id: 'q072', category: 'yanlis-bilinen', text: '“Kokusuzsa kesin güvenlidir” demek doğru mudur?', answer: false, explanation: 'Hayır. Koku olmaması mikrop veya kimyasal olmadığı anlamına gelmez.' },
  { id: 'q073', category: 'guvenlik', text: 'Gri su ile sulama yaparken mümkünse yaprak yerine toprağa/kök bölgesine vermek daha güvenli midir?', answer: true, explanation: 'Evet. Temas riskini azaltmak için gri su doğrudan yenilebilir yüzeye püskürtülmemelidir.' },
  { id: 'q074', category: 'tasarruf', text: 'Sebze yıkarken akan musluk yerine kap kullanmak su tasarrufu sağlar mı?', answer: true, explanation: 'Evet. Kapta yıkama hem daha az su harcar hem de kalan suyu değerlendirme fırsatı verir.' },
  { id: 'q075', category: 'guvenlik', text: 'Gri su ile elleri yıkamak güvenli bir kullanım mıdır?', answer: false, explanation: 'Hayır. Gri su hijyen amaçlı el yıkama veya içme için kullanılmaz.' },
  { id: 'q076', category: 'yeniden-kullanim', text: 'Lavaboda sadece toz/topraklı eller yıkandıysa bu su filtrelenip bahçe için değerlendirilebilir mi?', answer: true, explanation: 'Evet. Ağır kimyasal yoksa ve doğru uygulanırsa içme dışı sulamada değerlendirilebilir.' },
  { id: 'q077', category: 'guvenlik', text: 'Çamaşır makinesinden çıkan su klorlu deterjan içeriyorsa gri su kullanımına uygun mudur?', answer: false, explanation: 'Hayır. Klorlu veya bitkiye zararlı deterjanlar güvenli yeniden kullanımı bozar.' },
  { id: 'q078', category: 'tasarruf', text: 'Kaçak yapan rezervuarı tamir etmek, gri su sistemi olmasa bile önemli tasarruf sağlar mı?', answer: true, explanation: 'Evet. Gizli rezervuar kaçakları çok büyük su kaybına neden olabilir.' },
  { id: 'q079', category: 'yanlis-bilinen', text: 'Gri su kullanınca temizlik ve hijyen kurallarına gerek kalmaz.', answer: false, explanation: 'Hayır. Gri su kullanımı planlama, filtreleme ve hijyen kurallarını daha da önemli hale getirir.' },
  { id: 'q080', category: 'gri-su', text: 'Gri suyun amacı her suyu kullanmak değil, uygun suyu doğru yerde kullanmak mıdır?', answer: true, explanation: 'Evet. Eğitimde ana fikir budur: her atık su güvenli değildir, doğru kaynak doğru yerde kullanılmalıdır.' },
];

export function pickQuestions(count: number): Question[] {
  const copy = [...QUESTIONS];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, count);
}
