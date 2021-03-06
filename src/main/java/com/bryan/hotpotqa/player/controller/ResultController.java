package com.bryan.hotpotqa.player.controller;

import com.bryan.hotpotqa.player.entity.Result;
import com.bryan.hotpotqa.player.service.ResultDataService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ResultController {
    @Autowired
    ResultDataService resultDataService;
    @Value("${app.test}")
    private String envUrl;

    @GetMapping("/mrc/id/list")
    public Result list() {
        return Result.ok(resultDataService.getIdList());
    }

    @GetMapping("/mrc/noNer/id/list")
    public Result noNERList() {
        return Result.ok(resultDataService.getIdNoNerList());
    }

    @GetMapping("/mrc/type/list")
    public Result typeList() {
        return Result.ok(resultDataService.getTypeList());
    }

    @GetMapping("/mrc/id/type/list")
    public Result typeIdList() {
        return Result.ok(resultDataService.getTypeTagList());
    }

    @GetMapping("/mrc/id/level/list")
    public Result levelIdList() {
        return Result.ok(resultDataService.getLevelTagList());
    }

    @GetMapping("/mrc/type/predict/list")
    public Result typePredList() {
        return Result.ok(resultDataService.getTypePredictionList());
    }

    @GetMapping("/mrc/obj/id/{id}")
    public Result getById(@PathVariable("id") String id) {
        return Result.ok(resultDataService.getObjById(id));
    }

    @GetMapping("/mrc/ner/obj/id/{id}")
    public Result getNerObjById(@PathVariable("id") String id) {
        return Result.ok(resultDataService.getNerObjById(id));
    }

    @GetMapping("/mrc/obj/index/{index}")
    public Result getByIndex(@PathVariable("index") int index) {
        return Result.ok(resultDataService.getObjByIndex(index));
    }

//    @GetMapping("/test/env")
//    public Result testEnv() {
//        Result ok = Result.ok(System.getenv());
//        ok.setMessage(envUrl);
//        return ok;
//    }
}
