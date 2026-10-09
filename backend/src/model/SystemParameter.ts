// model/SystemParameter.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity
} from 'typeorm';

@Entity('system_parameters')
export class SystemParameter extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  value: string;

  static async getValue(name: string): Promise<string | null> {
    const param = await SystemParameter.findOneBy({ name });
    return param?.value || null;
  }

  static async updateValue(name: string, newValue: string): Promise<void> {
    let param = await SystemParameter.findOneBy({ name });
    if (param) {
      param.value = newValue;
      await param.save();
    } else {
      param = SystemParameter.create({ name, value: newValue });
      await param.save();
    }
  }
}
