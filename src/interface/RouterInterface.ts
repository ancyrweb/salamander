import * as express from "express";
import { Metadata } from "../kernel/MetadataCollector";

interface RouterInterface {
  receiveMetadata(instance: object, data: Metadata[]);
  integrate(app: express.Application);
}

export default RouterInterface;
