// Dynamic Schema Generator for Fynd.com
class FyndSchemaGenerator {
  constructor() {
    this.baseUrl = "https://www.fynd.com";
    this.organizationData = {
      "@type": "Organization",
      "@id": `${this.baseUrl}#organization`,
      name: "Fynd",
      url: this.baseUrl,
      logo: `${this.baseUrl}/logo.png`,
      sameAs: [
        "https://www.linkedin.com/company/fynd",
        "https://en.wikipedia.org/wiki/Fynd",
        "https://twitter.com/Fynd",
      ],
      description:
        "Fynd is an AI-powered unified commerce platform enabling brands to manage end-to-end retail operations.",
    };
  }

  // Generate base website schema
  generateWebsiteSchema() {
    return {
      "@type": "WebSite",
      "@id": `${this.baseUrl}#website`,
      url: this.baseUrl,
      name: "Fynd",
      description: "AI-powered unified commerce platform",
      publisher: { "@id": `${this.baseUrl}#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${this.baseUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    };
  }

  // Generate breadcrumb schema
  generateBreadcrumbSchema(breadcrumbs) {
    return {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }

  // Generate WebPage schema
  generateWebPageSchema(pageData) {
    const schema = {
      "@type": "WebPage",
      "@id": pageData.url,
      url: pageData.url,
      name: pageData.title,
      description: pageData.description,
      isPartOf: { "@id": `${this.baseUrl}#website` },
    };

    if (pageData.mainEntity) {
      schema.mainEntity = pageData.mainEntity;
    }

    return schema;
  }

  // Generate SoftwareApplication schema for solution pages
  generateSoftwareSchema(solutionData) {
    return {
      "@type": "SoftwareApplication",
      "@id": `${solutionData.url}#software`,
      name: solutionData.name,
      applicationCategory: solutionData.category || "RetailSoftware",
      operatingSystem: "Web",
      featureList: solutionData.features || [],
      offers: {
        "@type": "Offer",
        price: solutionData.price || "Contact for Pricing",
        priceCurrency: "USD",
        availability: "InStock",
        url: `${this.baseUrl}/contact`,
      },
      audience: {
        "@type": "Audience",
        audienceType: solutionData.audience || "Business",
      },
      url: solutionData.url,
      description: solutionData.description,
      manufacturer: { "@id": `${this.baseUrl}#organization` },
    };
  }

  // Generate Product schema
  generateProductSchema(productData) {
    return {
      "@type": "Product",
      name: productData.name,
      url: productData.url,
      description: productData.description,
      brand: { "@id": `${this.baseUrl}#organization` },
      offers: {
        "@type": "Offer",
        price: productData.price || "Contact for Pricing",
        priceCurrency: "USD",
        availability: "InStock",
        url: `${this.baseUrl}/contact`,
      },
    };
  }

  // Generate FAQ schema
  generateFAQSchema(faqs) {
    if (!faqs || faqs.length === 0) return null;

    return {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
  }

  // Generate Article schema for blog posts
  generateArticleSchema(articleData) {
    return {
      "@type": "Article",
      headline: articleData.title,
      description: articleData.description,
      image: articleData.image,
      author: {
        "@type": "Person",
        name: articleData.author || "Fynd Team",
      },
      publisher: { "@id": `${this.baseUrl}#organization` },
      datePublished: articleData.publishDate,
      dateModified: articleData.modifyDate || articleData.publishDate,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": articleData.url,
      },
    };
  }

  // Main method to generate complete schema based on page type
  generateSchema(pageConfig) {
    const graph = [];

    // Always include organization
    graph.push(this.organizationData);

    // Always include website
    graph.push(this.generateWebsiteSchema());

    // Add webpage schema
    const webPageSchema = this.generateWebPageSchema({
      url: pageConfig.url || window.location.href,
      title: pageConfig.title || document.title,
      description:
        pageConfig.description ||
        document.querySelector('meta[name="description"]')?.content,
      mainEntity: pageConfig.mainEntity,
    });
    graph.push(webPageSchema);

    // Add breadcrumbs if provided
    if (pageConfig.breadcrumbs) {
      graph.push(this.generateBreadcrumbSchema(pageConfig.breadcrumbs));
    }

    // Page type specific schemas
    switch (pageConfig.pageType) {
      case "solution":
        const softwareSchema = this.generateSoftwareSchema(
          pageConfig.solutionData
        );
        graph.push(softwareSchema);

        if (pageConfig.asProduct) {
          const productSchema = this.generateProductSchema({
            ...pageConfig.solutionData,
            isRelatedTo: { "@id": `${pageConfig.solutionData.url}#software` },
          });
          graph.push(productSchema);
        }
        break;

      case "article":
        graph.push(this.generateArticleSchema(pageConfig.articleData));
        break;

      case "product":
        graph.push(this.generateProductSchema(pageConfig.productData));
        break;
    }

    // Add FAQ if provided
    if (pageConfig.faqs) {
      const faqSchema = this.generateFAQSchema(pageConfig.faqs);
      if (faqSchema) graph.push(faqSchema);
    }

    return {
      "@context": "https://schema.org",
      "@graph": graph,
    };
  }

  // Inject schema into page
  injectSchema(schema) {
    // Remove existing schema script if any
    const existingScript = document.querySelector('script[data-schema="fynd"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create and inject new schema script
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-schema", "fynd");
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  }
}

// Page Configuration Manager
class PageConfigManager {
  static getConfigFromDataAttributes() {
    const body = document.body;
    const config = {};

    // Get basic page info
    config.url = window.location.href;
    config.title = document.title;
    config.description = document.querySelector(
      'meta[name="description"]'
    )?.content;

    // Get page type from data attribute
    config.pageType = body.dataset.pageType || "default";

    // Get breadcrumbs from data attribute or generate from URL
    if (body.dataset.breadcrumbs) {
      config.breadcrumbs = JSON.parse(body.dataset.breadcrumbs);
    } else {
      config.breadcrumbs = this.generateBreadcrumbsFromURL();
    }

    // Page type specific configurations
    switch (config.pageType) {
      case "solution":
        config.solutionData = {
          name: body.dataset.solutionName || document.title,
          url: config.url,
          description: config.description,
          features: body.dataset.features
            ? JSON.parse(body.dataset.features)
            : [],
          audience: body.dataset.audience,
          price: body.dataset.price,
          category: body.dataset.category,
        };
        config.asProduct = body.dataset.asProduct === "true";
        break;

      case "article":
        config.articleData = {
          title: config.title,
          url: config.url,
          description: config.description,
          author: body.dataset.author,
          publishDate: body.dataset.publishDate,
          modifyDate: body.dataset.modifyDate,
          image:
            body.dataset.image ||
            document.querySelector('meta[property="og:image"]')?.content,
        };
        break;

      case "product":
        config.productData = {
          name: body.dataset.productName || document.title,
          url: config.url,
          description: config.description,
          price: body.dataset.price,
        };
        break;
    }

    // Auto-detect FAQs from page content
    config.faqs = this.extractFAQsFromPage();

    return config;
  }

  static extractFAQsFromPage() {
    const faqs = [];

    // Look for Fynd FAQ structure using custom attributes
    const faqWrappers = document.querySelectorAll(
      '[fynd-faq-element="wrapper"]'
    );

    faqWrappers.forEach((wrapper) => {
      // Find the toggle element (contains the question)
      const toggle = wrapper.querySelector('[fynd-faq-element="toggle"]');
      // Find the content element (contains the answer)
      const content = wrapper.querySelector('[fynd-faq-element="content"]');

      if (toggle && content) {
        // Extract question from the toggle div
        const questionDiv = toggle.querySelector(
          'div[class*="title"], div[data-text-style], .accordian-title'
        );
        const questionText = questionDiv ? questionDiv.textContent.trim() : "";

        // Extract answer from the content div - look for richtext
        const richTextDiv = content.querySelector(
          '.richtext, [class*="richtext"], .rich-text, [class*="rich-text"]'
        );
        const answerText = richTextDiv
          ? richTextDiv.textContent.trim()
          : content.textContent.trim();

        if (questionText && answerText) {
          faqs.push({
            question: questionText,
            answer: answerText,
          });
        }
      }
    });

    return faqs.length > 0 ? faqs : null;
  }

  static generateBreadcrumbsFromURL() {
    const pathSegments = window.location.pathname
      .split("/")
      .filter((segment) => segment);
    const breadcrumbs = [{ name: "Home", url: "https://www.fynd.com" }];

    let currentPath = "https://www.fynd.com";
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      breadcrumbs.push({
        name:
          segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " "),
        url: currentPath,
      });
    });

    return breadcrumbs;
  }
}

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  const schemaGenerator = new FyndSchemaGenerator();
  const pageConfig = PageConfigManager.getConfigFromDataAttributes();
  const schema = schemaGenerator.generateSchema(pageConfig);
  schemaGenerator.injectSchema(schema);
});

// Export for manual usage
window.FyndSchema = {
  generator: FyndSchemaGenerator,
  configManager: PageConfigManager,
};
