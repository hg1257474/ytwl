module.exports = ({ mongoose }) => {
  const ResourceSchema = new mongoose.Schema(
    {
      category: String,
      content: mongoose.Schema.Types.Mixed
    },
    { timestamps: true }
  );
  return mongoose.model('Resource', ResourceSchema);
};
