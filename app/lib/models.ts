import mongoose, { Schema, model, models } from 'mongoose';

const ArticleSchema = new Schema({
  name:      { type: String, required: true },
  category:  { type: String, required: true },
  price:     { type: String, required: true },
  priceNum:  { type: Number, required: true },
  tag:       { type: String, required: true },
  image:     { type: String, required: true },
  images:    { type: [String], default: [] },
  sizes:       { type: [String], default: [] },
  colors:      { type: [String], default: [] },
  description: { type: String, default: '' },
  published:   { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

const OrderSchema = new Schema({
  id:        { type: String, required: true, unique: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  status:    { type: String, default: 'pending' },
  customer:  { type: Schema.Types.Mixed, required: true },
  items:     { type: Schema.Types.Mixed, required: true },
  subtotal:  { type: Number, required: true },
  delivery:  { type: Number, required: true },
  total:     { type: Number, required: true },
});

// Delete cached models in dev so schema changes take effect on hot reload
if (process.env.NODE_ENV === 'development') {
  delete (mongoose.connection as any).models?.Article;
  delete (models as any).Article;
  delete (mongoose.connection as any).models?.Order;
  delete (models as any).Order;
}

export const Article = models.Article || model('Article', ArticleSchema);
export const Order   = models.Order   || model('Order',   OrderSchema);
