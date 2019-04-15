module.exports = ({ mongoose }) => {
  const OrderSchema = new mongoose.Schema(
    {
      name: String,
      description: mongoose.Schema.Types.Mixed,
      customerId: mongoose.Schema.Types.ObjectId,
      servicerId: mongoose.Schema.Types.ObjectId,
      totalFee: Number,
      hasPaid: { type: Boolean, default: false }
    },
    { timestamps: true }
  );
  return mongoose.model('Order', OrderSchema);
};
