export function LocalBusinessSchema() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Learn Academy",
    "alternateName": "Learn Academy Birmingham",
    "description": "Expert 1-on-1 tutoring and home schooling services in Birmingham offering personalised education for ages 8-18.",
    "url": "https://learnacademy.co.uk",
    "telephone": "07779-602503",
    "email": "info@learnacademy.co.uk",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Birmingham",
      "postalCode": "B8 1AE",
      "addressCountry": "GB"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "52.4862",
      "longitude": "-1.8904"
    },
    "openingHours": [
      "Mo-Sa 09:00-18:00"
    ],
    "serviceArea": {
      "@type": "City",
      "name": "Birmingham"
    },
    "educationalLevel": [
      "Primary Education",
      "Secondary Education",
      "Further Education"
    ],
    "offers": [
      {
        "@type": "Offer",
        "name": "Foundation Program",
        "description": "Ages 8-11, Key Stage 2 tutoring",
        "price": "50",
        "priceCurrency": "GBP"
      },
      {
        "@type": "Offer",
        "name": "Elevate Program",
        "description": "Ages 11-14, Key Stage 3 & early KS4",
        "price": "70",
        "priceCurrency": "GBP"
      },
      {
        "@type": "Offer",
        "name": "GCSE Program",
        "description": "Ages 14-16, GCSE preparation",
        "price": "80",
        "priceCurrency": "GBP"
      },
      {
        "@type": "Offer",
        "name": "A-Level Program",
        "description": "Ages 16-18, Advanced science specialisation",
        "price": "100",
        "priceCurrency": "GBP"
      }
    ],
    "sameAs": [
      "https://linkedin.com/in/zaehid-hakim-1004016b"
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}