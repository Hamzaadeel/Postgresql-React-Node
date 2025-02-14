import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { User } from "../entities/User";
import { AppDataSource } from "../data-source";

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey:
    process.env.JWT_SECRET ||
    "a7eb8932ca3d1092e1470d665cc35072c45e1edf80dc4a1e1a9871d3f5fcf4c1",
};

export const passportConfig = (passport: any) => {
  passport.use(
    new JwtStrategy(opts, async (jwtPayload, done) => {
      try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
          where: { id: jwtPayload.id },
        });
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    })
  );
};
