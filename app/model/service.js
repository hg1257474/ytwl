module.exports = ({ mongoose }) => {
  const ServiceSchema = new mongoose.Schema(
    {
      customerId: mongoose.Schema.Types.ObjectId,
      managerId: mongoose.Schema.Types.ObjectId,
      processorId: mongoose.Schema.Types.ObjectId,
      name: [],
      status: String,
      orderId: mongoose.Schema.Types.ObjectId,
      comment: [],
      description: mongoose.Schema.Types.Mixed,
      conclusion: {},
      duration: { type: Number, default: 0 },
      contact: {
        name: String,
        phone: Number,
        method: String,
        content: String
      }
    },
    { timestamps: true }
  );
  return mongoose.model('Service', ServiceSchema);
};
/*
comment: [0, 0, 0, ""],
conclusion: {
  text: String,
  files: []
},
*/
