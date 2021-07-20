import cpu_instrs from "../public/rom/cpu_instrs/cpu_instrs.gb";
import instr_timing from "../public/rom/instr_timing/instr_timing.gb";
import mem_timing from "../public/rom/mem_timing-2/mem_timing.gb";
import dma_basic from "../public/rom/oam_dma/basic.gb";
import dma_reg_read from "../public/rom/oam_dma/reg_read.gb";
import dma_sources_GS from "../public/rom/oam_dma/sources-GS.gb";
import mona from "../public/rom/homebrew/mona.gb";
import retroid from "../public/rom/homebrew/retroid.gb";
import pocket from "../public/rom/homebrew/pocket.gb";
import gold from "../public/rom/cant_sue_me/gold.gbc";
import { GameBoy } from "./gb";
import { Site } from "./view/react/site";
import React from "react";
import ReactDOM from "react-dom";

let roms = [
  {
    name: "cpu_instrs",
    path: cpu_instrs,
    rom: null
  },
  {
    name: "instr_timing",
    path: instr_timing,
    rom : null
  },
  {
    name: "mem_timing",
    path: mem_timing,
    rom: null
  },
  {
    name: "dma_basic",
    path: dma_basic,
    rom: null
  },
  {
    name: "dma_reg_read",
    path: dma_reg_read,
    rom: null
  },
  {
    name: "dma_sources_GS",
    path: dma_sources_GS,
    rom: null
  },
  {
    name: "mona",
    path: mona,
    rom: null
  },
  {
    name: "retroid",
    path: retroid,
    rom: null
  },
  {
    name: "pocket",
    path: pocket,
    rom: null
  },
  {
    name: "gold",
    path: gold,
    rom: null
  }
];
async function load() {
  for(let i = 0; i < roms.length; i++) {
    let res = await fetch(roms[i].path);
    roms[i].rom = new Uint8Array(await res.arrayBuffer());
  }
  let gameBoy = new GameBoy();
  ReactDOM.render(React.createElement(Site, {
    gameBoy,
    roms
  }), document.querySelector("#mount"));
  window.roms = roms;
  window.gb = gameBoy;
}
load();
