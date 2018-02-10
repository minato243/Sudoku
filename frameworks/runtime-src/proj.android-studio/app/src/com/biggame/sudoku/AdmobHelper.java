package com.biggame.sudoku;

import android.app.Activity;
import android.content.Context;
import android.util.Log;
import android.view.View;
import android.widget.RelativeLayout;

import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.InterstitialAd;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.reward.RewardItem;
import com.google.android.gms.ads.reward.RewardedVideoAd;
import com.google.android.gms.ads.reward.RewardedVideoAdListener;

/**Created by thaod on 1/25/2018.*/

public class AdmobHelper {
    private static String TAG = "AmobHelper";

    private InterstitialAd mInterstitialAd;
    private RewardedVideoAd mRewardVideoAd;
    private AdView mAdview = null;

    public void init(final Context ctx){
        MobileAds.initialize(ctx, ctx.getString(R.string.admob_app_id));
        //this.initBanner(ctx);
        this.initInterstitial(ctx);
        this.initVideoReward(ctx);
    }

    public void initBanner(final Context ctx){
        if(mAdview != null) return;
        mAdview = new AdView(ctx);
        mAdview.setAdSize(AdSize.SMART_BANNER);
        mAdview.setAdUnitId(ctx.getString(R.string.admob_banner));

        AdRequest adRequest = new AdRequest.Builder().build();
        mAdview.loadAd(adRequest);

        mAdview.setAdListener(new AdListener() {
            @Override
            public void onAdClosed() {
                mAdview.loadAd(new AdRequest.Builder().build());
            }

            @Override
            public void onAdLoaded() {
                Log.d(TAG, "Banner onAdLoaded");
                ((Activity)ctx).runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mAdview.setVisibility(View.VISIBLE);
                    }
                });

            }
        });

        RelativeLayout layout = new RelativeLayout(ctx);
        ((Activity)ctx).addContentView(layout,
                new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.MATCH_PARENT,
                        RelativeLayout.LayoutParams.MATCH_PARENT));

        RelativeLayout.LayoutParams params = new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.WRAP_CONTENT,
                RelativeLayout.LayoutParams.WRAP_CONTENT);
        params.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
        params.addRule(RelativeLayout.CENTER_HORIZONTAL);
        layout.addView(mAdview, params);
        layout.setFocusable(false);
    }

    private void initVideoReward(final Context ctx){
        mRewardVideoAd = MobileAds.getRewardedVideoAdInstance(ctx);
        mRewardVideoAd.loadAd(ctx.getString(R.string.admob_video_reward), new AdRequest.Builder().build());
        mRewardVideoAd.setRewardedVideoAdListener(new RewardedVideoAdListener() {

            @Override
            public void onRewardedVideoAdLoaded() {
                Log.d(TAG,"onRewardedVideoAdLoaded" );
            }

            @Override
            public void onRewardedVideoAdOpened() {
                Log.d(TAG,"onRewardedVideoAdOpened");
            }

            @Override
            public void onRewardedVideoStarted() {
                Log.d(TAG,"onRewardedVideoStarted");
            }

            @Override
            public void onRewardedVideoAdClosed() {
                Log.d(TAG, "onRewardedVideoAdClosed");
                mRewardVideoAd.loadAd(ctx.getString(R.string.admob_video_reward), new AdRequest.Builder().build());
            }

            @Override
            public void onRewarded(RewardItem rewardItem) {
                Log.d(TAG, "onRewarded! currency: " + rewardItem.getType() + "  amount: " +
                        rewardItem.getAmount());
                AndroidUtils.callJSAddGold(rewardItem.getAmount());
            }

            @Override
            public void onRewardedVideoAdLeftApplication() {
                Log.d(TAG, "onRewardedVideoAdLeftApplication");

            }

            @Override
            public void onRewardedVideoAdFailedToLoad(int i) {
                Log.e(TAG,"onRewardedVideoAdFailedToLoad, errorCode = "+i);
            }
        });

    }

    private void initInterstitial(final Context ctx){
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

    public void showAdView(){
        mAdview.setVisibility(View.VISIBLE);
    }

    public void hideAdView(){
        mAdview.setVisibility(View.INVISIBLE);
    }

    public void showInterstitialAd(){
        if(mInterstitialAd.isLoaded()){
            mInterstitialAd.show();
        } else{
            Log.d(TAG, "The interstitial wasn't loaded yet.");
        }
    }

    public void showVideoRewardAd(){
        if(mRewardVideoAd.isLoaded()){
            mRewardVideoAd.show();
        } else {
            Log.d(TAG, "The rewardVideoAd wasn't loaded yet.");
        }
    }

    public AdView getAdView(){
        return mAdview;
    }
}
