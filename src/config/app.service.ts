import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  run() {
    console.log('Running...');
  }
}
