import { Setting } from '../entity/Setting';

class SettingRepository {
  async get(name: string) {
    return Setting.findOne({ name });
  }

  async update(name: string, value: string) {
    return Setting.update({ name }, { value });
  }
}

export default new SettingRepository();
