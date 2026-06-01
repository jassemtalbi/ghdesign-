import mongoose, { Schema, model, models } from 'mongoose';

const ArticleSchema = new Schema({
  name:      { type: String, required: true },
  category:  { type: String, required: true },
  price:     { type: String, required: true },
  priceNum:  { type: Number, required: true },
  tag:       { type: String, required: true },
  image:     { type: String, required: true },
  published: { type: Boolean, default: false },
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

export const Article = models.Article || model('Article', ArticleSchema);
export const Order   = models.Order   || model('Order',   OrderSchema);
