package com.biggame.sudoku;

import android.content.Context;
import android.util.Log;

import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.InterstitialAd;
import com.google.android.gms.ads.MobileAds;

/**Created by thaod on 1/25/2018.*/

public class AdmobHelper {
    private static String TAG = "AmobHelper";

    private InterstitialAd mInterstitialAd;

    public void init(Context ctx){
        MobileAds.initialize(ctx, ctx.getString(R.string.admob_app_id));

        mInterstitialAd = new InterstitialAd(ctx);
        mInterstitialAd.setAdUnitId(ctx.getString(R.string.admob_interstitial));
        mInterstitialAd.loadAd(new AdRequest.Builder().build());

        mInterstitialAd.setAdListener(new AdListener(){
            @Override
            public void onAdClosed() {
                super.onAdClosed();
                mInterstitialAd.loadAd(new AdRequest.Builder().build());
            }
        });
    }

    public void showInterstitialAd(){
        if(mInterstitialAd.isLoaded()){
            mInterstitialAd.show();
        } else{
            Log.d(TAG, "The interstitial wasn't loaded yet.");
        }
    }
}
