import { Component, OnInit, OnDestroy } from '@angular/core';
import { SudoService } from '../../service/sudo/sudo.service';
import { Subscription, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { Storage } from '@ionic/storage';
import { LanService } from '../../service/lan/lan.service';
import { Events } from '@ionic/angular';

@Component({
  selector: 'app-play',
  templateUrl: './play.page.html',
  styleUrls: ['./play.page.scss'],
})
export class PlayPage implements OnInit, OnDestroy {
  endSubscription: Subscription

  numArr: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  starArr: Array<number> = []
  sudoData = {
    sudoArr: [],
    blankArr: [],
    blankEditBoard: [],
    sudoPlayArr: [],
    errorArr: [],
    time: 0,
    star: 5,
    nowMode: 0,
    mode: [1, 1, 1],
    allStars: [
      {
        mode: 0,
        starNum: 0,
        totalTime: 0,
      },
      {
        mode: 1,
        starNum: 0,
        totalTime: 0,
      },
      {
        mode: 2,
        starNum: 0,
        totalTime: 0,
      }
    ]
  }
  sudoShow = {
    sudoReady: false,
    playNumber: null,
    tipNumberIndexes: [],
    showTime: '00:00',
    pauseTime: false,
  }
  sudoPlay = {
    playId: 999,
  }
  showTimeInterval: any
  checksudoReadyInterval: any
  playBtnStatus = false
  LanData
  hardModeName

  constructor(
    private sudoService: SudoService,
    private router: Router,
    private storage: Storage,
    private lanService: LanService,
    private events: Events,
  ) {
    this.starArr = this.sudoService.starArr
    this.sudoPlay = this.sudoService.SudoPlay

    this.endSubscription = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(_ => {
      console.log('End Subscription, Time: ' + this.sudoShow.showTime)
      this.sudoPlay.playId = Math.floor(Math.random() * 1000)
      this.pauseShowTime()
    })

    this.initSudo()
    this.events.subscribe('lan:dataChange', (data) => {
      this.LanData = data
      this.hardModeName = [this.LanData.common.starter, this.LanData.common.normal, this.LanData.common.master]
    })
  }

  ngOnInit() {
  }
  ngOnDestroy() {
    this.endSubscription.unsubscribe() // 不要忘记处理手动订阅
  }

  initSudo() {
    this.sudoService.InitSudo().then(() => {
      this.sudoData = this.sudoService.SudoData
      this.sudoShow = this.sudoService.SudoShow
      console.log(this.sudoShow.sudoReady)
      console.log(this.sudoData)
      this.lanService.getLanguage().then(() => {
        if (this.lanService.LanData) {
          this.LanData = this.lanService.LanData
          this.hardModeName = [this.LanData.common.starter, this.LanData.common.normal, this.LanData.common.master]
        } else {
          this.lanService.getLanJson()
            .subscribe((data) => {
              this.LanData = data
              this.hardModeName = [this.LanData.common.starter, this.LanData.common.normal, this.LanData.common.master]
            })
        }
        console.log(this.sudoShow.sudoReady)
      })
    })
  }

  newGame(): void {
    this.sudoService.newGame(this.LanData.common)
  }

  nextLevelGame(): void {
    this.sudoService.createNewGame(this.sudoData.nowMode)
  }

  getModeName() {
    if (this.hardModeName && this.sudoData) {
      const nowModeName = this.hardModeName[this.sudoData.nowMode]
      const nowModeLevel = this.sudoData.mode[this.sudoData.nowMode]
      return `${nowModeName} ${nowModeLevel}`
    }
    return ''
  }
  getModeNameWithIndex(index: number) {
    if (this.hardModeName) {
      const thisModeName = this.hardModeName[index]
      const thisModeLevel = this.sudoData.mode[index]
      return `${thisModeName} Lv${thisModeLevel}`
    }
    return ''
  }

  seeIfBlank(index: number) {
    return this.sudoService.seeIfBlank(index)
  }

  seeIfBlankBoard(index: number) {
    return this.sudoService.seeIfBlankBoard(index)
  }

  setThisEditBoardStatus() {
    return this.sudoService.setThisEditBoardStatus()
  }

  seeIfBlankBoardNumber(index: number, num: number) {
    return this.sudoService.seeIfBlankBoardNumber(index, num)
  }

  seeIfShowSmallBtn() {
    return this.sudoService.seeIfShowSmallBtn()
  }

  setShowPlayNumber(index: number): void {
    console.log(this.sudoData.sudoArr[index])
    this.sudoService.setShowPlayNumber(index)
  }

  numEmptyPress(index: number): void {
    this.setShowPlayNumber(index)
    this.setThisEditBoardStatus()
  }

  clearPlayNumber(): void {
    this.sudoService.clearPlayNumber()
  }

  clickPlayNumber(num: number): void {
    this.sudoService.clickPlayNumber(num)
  }

  checkSomeNumbers(num: number) {
    this.sudoService.checkSomeNumbers(num)
  }

  clickPlayOrPauseBtn() {
    if (this.playBtnStatus) {
      this.startShowTime()
    } else {
      this.pauseShowTime()
    }
    this.playBtnStatus = !this.playBtnStatus
  }

  startShowTime() {
    this.sudoService.startShowTime()
  }

  pauseShowTime() {
    this.sudoService.pauseShowTime()
  }
}
