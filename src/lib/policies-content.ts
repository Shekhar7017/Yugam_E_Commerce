export type PolicySection = { heading: string; body: string };
export type Policy = { title: string; icon: "truck" | "rotate" | "shield" | "file"; sections: PolicySection[] };

export const POLICIES: Record<string, Policy> = {
  shipping: {
    title: "Shipping Policy",
    icon: "truck",
    sections: [
      {
        heading: "Delivery Timeline",
        body: "Orders are packed and dispatched within 1-2 business days. Standard delivery takes 4-7 business days depending on the destination.",
      },
      {
        heading: "Shipping Charges",
        body: "Shipping is free on orders above ₹999. A flat fee of ₹79 applies on orders below that threshold.",
      },
      {
        heading: "Tracking Your Order",
        body: "Once shipped, a tracking number is shared via email and can be checked on the Track Order page or in your account under My Orders.",
      },
      {
        heading: "Coverage",
        body: "We currently ship only within India. International shipping is not available at this time.",
      },
    ],
  },
  returns: {
    title: "Returns & Refunds Policy",
    icon: "rotate",
    sections: [
      {
        heading: "Return Window",
        body: "Unused items in original packaging can be returned within 7 days of delivery.",
      },
      {
        heading: "Non-Returnable Items",
        body: "Opened incense, consecrated idols that have been used in a ritual, and customized or personalized items cannot be returned.",
      },
      {
        heading: "How to Request a Return",
        body: "Contact us via the Contact Us page with your order number and reason for return within 7 days of delivery.",
      },
      {
        heading: "Refund Timeline",
        body: "Refunds are processed to the original payment method within 5-7 business days after the returned item is received and inspected. For Cash on Delivery orders, refunds are issued as store credit or bank transfer.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    icon: "shield",
    sections: [
      {
        heading: "Information We Collect",
        body: "We collect the information you provide when creating an account, placing an order, or contacting us — including your name, email, phone number, and shipping address.",
      },
      {
        heading: "How We Use Your Information",
        body: "This information is used solely to process orders, provide customer support, and improve our services. We do not sell or rent your personal information to third parties.",
      },
      {
        heading: "Payment Security",
        body: "Your payment details are processed securely by Razorpay and are never stored on our servers.",
      },
      {
        heading: "Cookies",
        body: "We use cookies to keep your cart and session working correctly. You can control cookies through your browser settings.",
      },
      {
        heading: "Your Rights",
        body: "For any questions about how your data is handled, or to request that your data be deleted, please contact us via the Contact Us page.",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    icon: "file",
    sections: [
      {
        heading: "Acceptance of Terms",
        body: "By using this website and placing an order, you agree to the following terms.",
      },
      {
        heading: "Product Availability",
        body: "All products are subject to availability. We reserve the right to limit quantities or refuse any order at our discretion.",
      },
      {
        heading: "Pricing",
        body: "Prices are listed in Indian Rupees (INR) and are subject to change without notice. The price at the time of order confirmation is the price you will be charged.",
      },
      {
        heading: "Intellectual Property",
        body: "All content on this site — including product descriptions, images, and branding — is the property of the store and may not be reproduced without permission.",
      },
      {
        heading: "Limitation of Liability",
        body: "We are not liable for delays caused by circumstances beyond our reasonable control, including courier delays, natural events, or disruptions to logistics networks.",
      },
      {
        heading: "Changes to These Terms",
        body: "These terms may be updated from time to time. Continued use of the site after changes constitutes acceptance of the updated terms.",
      },
    ],
  },
};

export const POLICY_ORDER = ["shipping", "returns", "privacy", "terms"];