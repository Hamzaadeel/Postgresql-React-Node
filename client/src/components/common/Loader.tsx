import { motion } from "framer-motion";

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-20">
      {/* Animated Box */}
      <motion.div
        className="w-12 h-12 bg-slate-800 rounded-md"
        animate={{
          rotate: [0, 22.5, 45, 67.5, 90],
          y: [0, 9, 18, 9, 0],
          borderBottomRightRadius: ["4px", "3px", "40px", "3px", "4px"],
          scaleY: [1, 0.9, 1],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Shadow */}
      <motion.div
        className="absolute w-12 h-1.5 bg-slate-300/50 rounded-full mt-16"
        animate={{
          scaleX: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <p className="p-2 text-center text-gray-500">Loading...</p>
    </div>
  );
};

export default Loader;
