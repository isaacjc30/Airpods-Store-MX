// ===== CONFIGURACIÓN ÚNICA: edita aquí todos los datos de la tienda =====
// Cada precio se define una sola vez aquí y se usa en catálogo, ficha, comparador,
// recomendador, carrito y mensajes de WhatsApp.
const CONFIG = {
  brand: "AirPods Store MX",
  // Código de país + número, sin espacios ni signos. México: 52 + 10 dígitos.
  whatsapp: "525650620897",
  currency: "MXN",

  // Zonas de entrega (las entregas se acuerdan por WhatsApp; no se publica ninguna dirección privada).
  zones: ["CDMX", "Estaciones del Metro", "Jardines de Morelos", "Real del Valle", "Las Américas (Ecatepec)"],

  // Garantía según el proveedor. Se descuentan los días desde tu compra.
  warrantyDays: 30,

  // Pagos aceptados
  payments: ["Efectivo en la entrega", "Transferencia"],

  // Todos los modelos son réplicas OEM Premium, no productos originales de Apple.
  // images: fotos reales del producto dentro de img/products/. Si falta una, la página la oculta.
  products: [
    {
      id: "pro3", fit: "almohadilla", newest: true,
      name: "AirPods Pro 3",
      tag: "Pro 3",
      price: 449,
      desc: "Modelo de la línea Pro. OEM Premium.",
      images: ["img/products/pro3-1.jpg", "img/products/pro3-2.jpg"]
    },
    {
      id: "pro2", fit: "almohadilla",
      name: "AirPods Pro 2",
      tag: "Pro 2",
      price: 449,
      desc: "Modelo de la línea Pro. OEM Premium.",
      images: ["img/products/pro2-1.jpg", "img/products/pro2-2.jpg"]
    },
    {
      id: "gen4", fit: "sin almohadilla",
      name: "AirPods 4.ª generación",
      tag: "4.ª gen",
      price: 449,
      desc: "Modelo de 4.ª generación. OEM Premium.",
      images: ["img/products/gen4-1.jpg", "img/products/gen4-2.jpg"]
    }
  ],

  // Mensajes de compradores (publicados con su permiso).
  // rating: calificación que dio el cliente (de 5).
  reviews: [
    { src: "img/reviews/resena1.jpg", rating: 4.9 },
    { src: "img/reviews/resena2.jpg", rating: 4.8 },
    { src: "img/reviews/resena3.jpg", rating: 5 }
  ],

  // Redes sociales: pon la URL completa. Vacío = no se muestra.
  social: { instagram: "https://www.instagram.com/pods_marked_0?cplk=dm1qYzQ1emxoc3J0", facebook: "", tiktok: "" },

  // Correo de contacto. Vacío = no se muestra.
  email: "airpods.store.mx12@gmail.com"
};
