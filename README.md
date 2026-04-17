# The Jewel Bazzar Backend

Production-ready Node.js, Express, and MongoDB backend for a jewellery e-commerce platform.

## Folder Structure

```text
product-data/
  photos/
  product-description.md
src/
  app.js
  index.js
  config/
    cloudinary.js
    database.js
    env.js
    mailer.js
    stripe.js
  controllers/
    admin.controller.js
    auth.controller.js
    cart.controller.js
    health.controller.js
    order.controller.js
    product.controller.js
    upload.controller.js
  middlewares/
    auth.middleware.js
    error.middleware.js
    notFound.middleware.js
    upload.middleware.js
    validate.middleware.js
  models/
    Cart.js
    Category.js
    Order.js
    Product.js
    User.js
  routes/
    admin.routes.js
    auth.routes.js
    cart.routes.js
    health.routes.js
    index.js
    order.routes.js
    product.routes.js
    upload.routes.js
  services/
    dashboard.service.js
    email.service.js
    order.service.js
    payment.service.js
    product.service.js
    token.service.js
  utils/
    ApiError.js
    ApiResponse.js
    asyncHandler.js
    constants.js
    query.js
  validators/
    auth.validator.js
    cart.validator.js
    order.validator.js
    product.validator.js
  scripts/
    seedAdmin.js
docs/
  postman/
    TheJewelBazzar.postman_collection.json
.env.example
README.md
```

## Setup Instructions

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and add MongoDB, SMTP, Stripe, and Cloudinary credentials.
3. Add `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` to the real `.env` file. The app does not read `.env.example` directly.
4. Seed or resync the admin user with `npm run seed:admin`.
5. Start the API with `npm run dev`.

## Key API Routes

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/admin/login`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password/:token`
- `GET /api/v1/auth/me`
- `GET /api/v1/products`
- `GET /api/v1/products/categories`
- `GET /api/v1/products/:productId`
- `POST /api/v1/products`
- `PATCH /api/v1/products/:productId`
- `DELETE /api/v1/products/:productId`
- `GET /api/v1/cart`
- `POST /api/v1/cart`
- `PATCH /api/v1/cart/:productId`
- `DELETE /api/v1/cart/:productId`
- `POST /api/v1/orders`
- `POST /api/v1/orders/:orderId/verify-payment`
- `GET /api/v1/orders`
- `GET /api/v1/orders/:orderId`
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/orders`
- `PATCH /api/v1/admin/orders/:orderId/status`
- `GET /api/v1/admin/dashboard`
- `POST /api/v1/uploads/products/:productId/images`

## Notes

- Access and refresh tokens are returned in the auth response.
- Stripe Payment Intents are used for payments.
- Cloudinary image uploads expect `multipart/form-data` with `images`.
- The sample Postman collection is available in `docs/postman`.
- Store local product photos in `backend/product-data/photos/` and product copy in `backend/product-data/product-description.md`.
