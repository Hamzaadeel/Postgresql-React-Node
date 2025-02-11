//Script to hash all existing passwords in the database

import { AppDataSource } from "../data-source"; // Adjust the path as necessary
import { User } from "../entities/User"; // Adjust the path as necessary
import bcrypt from "bcrypt";

const hashPasswords = async () => {
  try {
    // Initialize the data source
    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();

    for (const user of users) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 10); // 10 is the salt rounds

      // Update the user with the hashed password
      user.password = hashedPassword;
      await userRepository.save(user);
      console.log(`Updated password for user: ${user.email}`);
    }

    console.log("All passwords have been hashed successfully.");
  } catch (error) {
    console.error("Error hashing passwords:", error);
  } finally {
    // Close the data source connection
    await AppDataSource.destroy();
  }
};

// Run the script
hashPasswords();
