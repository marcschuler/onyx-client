export * from './channelController.service';
import { ChannelControllerService } from './channelController.service';
export * from './infoController.service';
import { InfoControllerService } from './infoController.service';
export * from './sectionController.service';
import { SectionControllerService } from './sectionController.service';
export * from './serverController.service';
import { ServerControllerService } from './serverController.service';
export const APIS = [ChannelControllerService, InfoControllerService, SectionControllerService, ServerControllerService];
