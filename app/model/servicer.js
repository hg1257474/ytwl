module.exports = ({ mongoose }) => {
  const ServicerSchema = new mongoose.Schema(
    {
      username: String,
      password: String,
      openId: String,
      oAOpenId: String,
      name: String,
      avatar: [],
      serviceTotal: Number,
      grade: Number,
      expert: String,
      privilege: {},
      services: [mongoose.Schema.Types.ObjectId]
    },
    { timestamps: true }
  );
  return mongoose.model('Servicer', ServicerSchema);
};
/*
  canManageUser: Boolean,
        canAssignService: Boolean,
        canInitiatePayment: Boolean,
        canManageServicer: Boolean,
        canProcessingService: Boolean
        */
