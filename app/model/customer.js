module.exports = ({ mongoose }) => {
  const CustomerSchema = new mongoose.Schema(
    {
      openId: String,
      vip: {
        kind: String,
        balance: Number,
        expires: Date
      },
      consumption: {
        type: Number,
        default: 0
      },
      info: {
        company: { type: String, default: '' },
        storeTotal: { type: Number, default: 0 },
        franchiseMode: { type: String, default: '' },
        contact: { type: String, default: '' },
        phone: { type: Number, default: 0 },
        weChat: { type: String, default: '' },
        dingTalk: { type: String, default: '' }
      },
      orders: [mongoose.Schema.Types.ObjectId],
      services: [mongoose.Schema.Types.ObjectId],
      points: { total: { type: Number, default: 0 }, records: [] }
    },
    { timestamps: true }
  );
  return mongoose.model('Customer', CustomerSchema);
};
