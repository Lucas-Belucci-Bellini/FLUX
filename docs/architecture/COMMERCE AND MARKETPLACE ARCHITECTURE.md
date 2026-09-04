# FLUX — COMMERCE AND MARKETPLACE ARCHITECTURE

## Purpose

Define marketplace boundaries so product discovery can be deeply connected to content without mixing commerce state with social content state.

## Domains

```text
Store
Catalog
Product
Inventory
Cart
Order
Payment Integration
Fulfillment
Review
Creator / Seller
```

## Content connection

```text
Video / Short / Live / Community / Creator
                 ↓
          Product relation
                 ↓
             Product
                 ↓
              Store
```

This relation is discovery metadata. Purchase state belongs to Commerce.

## Order lifecycle

```text
CART
→ CHECKOUT_INTENT
→ PAYMENT_PENDING
→ PAID
→ FULFILLING
→ SHIPPED / DELIVERED
→ COMPLETED
```

Failure states must be explicit and retry-safe.

## Money boundary

Payment provider integration must be isolated behind a port. Domain code must not depend directly on provider SDKs.

## Idempotency

Checkout, payment callbacks and order transitions require idempotency protection.

## Seller permissions

A creator does not automatically become a seller. Store ownership and commerce permissions are explicit capabilities.

## Reviews

Reviews are community content with commerce context. Moderation applies to them, while order/eligibility rules remain commerce-owned.

## Auditing

Financially significant state transitions require durable audit records.
