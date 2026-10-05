import { Component } from '@angular/core';

interface PhotoCredit {
  attraction: string;
  file: string;
  author: string;
  license: string;
}

@Component({
  selector: 'app-credits',
  template: `
    <header class="page-header">
      <div>
        <h1>Photo credits</h1>
        <p>Attraction photos are from Wikimedia Commons and are used under the licences shown.</p>
      </div>
    </header>
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Attraction</th>
            <th scope="col">Author</th>
            <th scope="col">Licence</th>
            <th scope="col">Source</th>
          </tr>
        </thead>
        <tbody>
          @for (credit of credits; track credit.file) {
            <tr>
              <td>{{ credit.attraction }}</td>
              <td>{{ credit.author }}</td>
              <td>{{ credit.license }}</td>
              <td>
                <a [href]="'https://commons.wikimedia.org/wiki/File:' + credit.file" target="_blank" rel="noopener">
                  Wikimedia Commons
                </a>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class Credits {
  protected readonly credits: PhotoCredit[] = [
    { attraction: 'Royal Botanical Gardens, Peradeniya', file: 'Botanical_Garden_of_Peradeniya_03.jpg', author: 'Bernard Gagnon', license: 'CC BY-SA 3.0' },
    { attraction: 'Hanthana Katusukonda Hike', file: 'Hanthana_range.JPG', author: 'Astronomyinertia', license: 'CC BY-SA 3.0' },
    { attraction: 'British Garrison Cemetery', file: 'British_Garrison_Cemetery.jpg', author: 'AntanO', license: 'CC BY-SA 4.0' },
    { attraction: 'Loolkandura Tea Heritage Hike', file: 'Loolecondera_estate_(nameboard).JPG', author: 'AntanO', license: 'CC BY-SA 4.0' },
    { attraction: 'Ceylon Tea Museum', file: 'KANDY_TEA_MUSEUM_KANDY_TOWN_SRI_LANKA_JAN_2013_(8583226551).jpg', author: 'calflier001', license: 'CC BY-SA 2.0' },
    { attraction: 'Sri Dalada Maligawa', file: 'SL_Kandy_asv2020-01_img33_Sacred_Tooth_Temple.jpg', author: 'A.Savin', license: 'Free Art License' },
    { attraction: 'Lankatilaka Temple', file: 'Lankathilaka_Vhihara_-_Le_temple.JPG', author: 'BluesyPete', license: 'CC BY-SA 3.0' },
    { attraction: 'Gadaladeniya Temple', file: 'Gadaladeniya_Viharaya_02.JPG', author: 'Cherubino', license: 'CC BY-SA 3.0' },
    { attraction: 'National Museum of Kandy', file: 'Kandy_National_Museum.jpg', author: 'Ji-Elle', license: 'CC BY-SA 3.0' },
    { attraction: 'Commonwealth War Cemetery', file: 'Kandy_War_Cemetery.JPG', author: 'AntanO', license: 'CC BY-SA 4.0' },
  ];
}
