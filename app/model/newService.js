module.exports = ({mongoose}) => {
  const NewServiceSchema = new mongoose.Schema(
    {
      serviceId:mongoose.Schema.Types.ObjectId,
    }
  );
  return mongoose.model("NewService", NewServiceSchema);
};
