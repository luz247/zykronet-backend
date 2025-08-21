import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
  })
  email: string;

  @Prop({ type: String, default: 'other' })
  empresa?: string;

  @Prop({ type: Boolean, default: true })
  isActive?: string;

  // <- aquí especifica type: String por el union string|null
  @Prop({
    type: String, // <— ¡IMPORTANTE!
    select: false,
    default: null,
    required: function (this: any) {
      return !this.googleId; // requerido si no hay googleId
    },
  })
  passwordHash?: string | null;

  @Prop({ type: String, unique: true, sparse: true, index: true })
  googleId?: string;

  @Prop({ type: String })
  avatar?: string;

  @Prop({ type: Boolean, default: false })
  oauthOnly?: boolean;

  @Prop({ type: [String], default: ['customer'] })
  roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Validación adicional (opcional)
UserSchema.pre('save', function (next) {
  const self = this as any;
  if (!self.passwordHash && !self.googleId) {
    next(new Error('El usuario debe tener una passwordHash o un googleId.'));
  } else next();
});

// Limpia el hash en cualquier salida
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    Reflect.deleteProperty(ret, 'passwordHash');
    return ret;
  },
});
UserSchema.set('toObject', {
  transform: (_doc, ret) => {
    Reflect.deleteProperty(ret, 'passwordHash');
    return ret;
  },
});
